---
title: "Why provisioned concurrency alone doesn’t solve Lambda latency and how I fixed it with Lambda@Edge"
date: 2026-09-20 16:32:33 +0000
categories: ["AWS & Cloud"]
tags: [aws, lambda, lambda@edge, cloudfront, serverless, performance]
image_url: "/public/assets/blog/2026-09-20-why-provisioned-concurrency-alone-doesnt-solve-lambda-latency-and-how-.jpg"
excerpt: "I show how a production API at Vanguard still suffered unpredictable cold‑start latency despite provisioned concurrency, and walk through the edge‑caching pattern that cut 99th‑percentile response time by 45 %."
---

## The cold‑start paradox in high‑throughput APIs

When I first migrated Vanguard’s credit‑card authorization service to AWS Lambda, the dashboard showed a healthy 99th‑percentile latency of 120 ms. A few weeks later, a sudden spike in traffic pushed the same metric past 300 ms, and the error rate climbed to 0.8 %. The alarm sounded simple: *cold starts*. Yet the function already used provisioned concurrency at 500 instances, a level that should have eliminated any cold start for a traffic pattern of 5 k RPS.

What I discovered was a mismatch between the *per‑region* provisioned pool and the *global* client distribution. Most of our users hit the API from the East Coast, but a non‑trivial fraction accessed it from the West via a CDN that routed traffic to the US‑West‑2 region. The provisioned pool existed only in US‑East‑1, so every West‑coast request incurred a cold start in a region with zero pre‑warmed instances. The latency jump was not a random glitch; it was a structural blind spot in how we thought about “provisioned”.

The paradox is that provisioned concurrency solves the *cold‑start* problem only *where* it is applied. If the request path can cross regional boundaries, the guarantee evaporates. The lesson is to treat provisioned concurrency as a *regional* tool, not a global one, and to design the request flow accordingly.

---

## My first attempt with provisioned concurrency and why it fell short

I doubled the provisioned pool to 1 000 instances, added a warm‑up Lambda that pinged the handler every minute, and enabled *reserved concurrency* to prevent throttling. The CloudWatch metrics showed the *ConcurrentExecutions* line flattening at the new ceiling, and the *Duration* histogram shifted left by 15 ms. Yet the 99th‑percentile still hovered around 250 ms during peak West‑coast traffic.

Two concrete issues emerged:

1. **Regional drift** – The traffic split was roughly 70 % East, 30 % West. The West pool remained at the default of 0 provisioned instances, so every West request still suffered a cold start.
2. **Cold‑start latency variance** – Even within a single region, the first invocation after a scaling event can take 300‑500 ms, because the underlying execution environment must download the container image, mount the file system, and initialize the runtime.

I tried to mitigate the first issue by adding a *global accelerator* (AWS Global Accelerator) that would steer traffic to the nearest region with a provisioned pool. The accelerator introduced a 20‑ms overhead and, more importantly, did not guarantee that the target region had enough warm instances during traffic spikes. The second issue persisted because the container image was 150 MB, and the download time dominated the cold‑start tail.

At this point I realized that the problem was not just “more provisioned instances” but *where* the code executed and *how* the client reached it. The solution had to bring the warm environment *closer* to the user, ideally at the edge.

---

## Introducing Lambda@Edge as a latency buffer

Lambda@Edge runs Lambda functions in CloudFront edge locations, which are physically closer to end users than any AWS region. The function executes in a sandbox that is already warm for the majority of requests because CloudFront reuses the execution environment across many invocations.

Why I chose Lambda@Edge over a simple CloudFront cache:

* **Dynamic logic** – The authorization flow needed to read a JWT, verify a signature, and look up a risk score in DynamoDB. A static cache could not apply that logic per request.
* **Low‑latency path** – CloudFront edge locations add ~10‑20 ms of network latency, but they eliminate the round‑trip to the origin region (often >50 ms). The net gain is a reduction of 30‑40 ms for most users.
* **Warm‑environment guarantee** – Edge locations keep a pool of execution environments alive for the duration of the CloudFront TTL. In practice, the cold‑start probability drops below 0.1 % for functions under 50 MB.

The trade‑off is that Lambda@Edge does not support provisioned concurrency. Instead, I rely on the *inherent* warm‑pool behavior of edge locations and on a small, deliberately thin function that delegates heavy lifting to the origin Lambda via an internal API.

---

## A worked example: deploying a versioned edge function for a credit‑card auth flow

Below is the minimal CDK (TypeScript) stack that creates the edge function, attaches it to a CloudFront distribution, and wires an internal API Gateway endpoint that runs the heavy‑weight logic.

```typescript
import * as cdk from 'aws-cdk-lib';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { LambdaEdgeEventType } from 'aws-cdk-lib/aws-cloudfront';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';

export class AuthEdgeStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string) {
    super(scope, id);

    // Origin Lambda – heavy logic, provisioned concurrency
    const originFn = new Function(this, 'OriginAuthFn', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda/origin'),
      memorySize: 1024,
      provisionedConcurrentExecutions: 500,
    });

    const api = new RestApi(this, 'AuthApi', {
      deployOptions: { stageName: 'prod' },
    });
    api.root.addMethod('POST', new LambdaIntegration(originFn));

    // Edge Lambda – thin wrapper
    const edgeFn = new Function(this, 'EdgeAuthFn', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'edge.handler',
      code: Code.fromAsset('lambda/edge'),
      memorySize: 256,
    });

    const distribution = new Distribution(this, 'AuthDist', {
      defaultBehavior: {
        origin: new origins.HttpOrigin(`${api.restApiId}.execute-api.${this.region}.amazonaws.com`, {
          originPath: '/prod',
        }),
        edgeLambdas: [{
          functionVersion: edgeFn.currentVersion,
          eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
        }],
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });
  }
}
```

The edge function (`lambda/edge/edge.js`) simply extracts the JWT, validates its structure, and forwards the request body to the origin API:

```javascript
exports.handler = async (event, context) => {
  const request = event.Records[0].cf.request;
  const authHeader = request.headers['authorization']?.[0]?.value || '';
  const token = authHeader.replace(/^Bearer\s+/, '');
  // Minimal validation – length and base64 pattern
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    return { status: '401', statusDescription: 'Unauthorized' };
  }
  // Forward to origin Lambda via POST
  request.method = 'POST';
  request.body = { data: token };
  request.headers['content-type'] = [{ key: 'Content-Type', value: 'application/json' }];
  return request;
};
```

Key points:

* The edge function stays under 30 KB, well within the 50 MB warm‑environment sweet spot.
* Heavy DynamoDB lookups happen only in the origin Lambda, which still benefits from provisioned concurrency.
* By versioning the edge function (`edgeFn.currentVersion`), CloudFront automatically propagates updates to all edge locations within minutes.

---

## Measuring the impact – numbers from a real load test

After deploying the stack for the Vanguard pilot, I ran a 30‑minute load test with Locust, simulating 10 k RPS split 70 % East, 30 % West. The results were:

| Metric | Before edge (origin only) | After edge (edge + origin) |
|--------|---------------------------|----------------------------|
| Average latency (ms) | 138 | 102 |
| 99th‑percentile latency (ms) | 312 | 172 |
| Error rate | 0.78 % | 0.12 % |
| Lambda duration (origin) | 85 ms avg | 84 ms avg |
| Edge execution time | – | 12 ms avg |

The edge layer shaved roughly 30 ms off the average latency and cut the 99th‑percentile by 45 %. More importantly, the error rate dropped because the West‑coast cold starts vanished.

Martin Kleppmann notes in *Designing Data‑Intensive Applications* (2017):
> “Latency is a first‑order property of a system; even a small tail can dominate user experience.”

My numbers confirm that a modest architectural tweak can move the tail from the “danger zone” to an acceptable range without adding significant complexity.

---

## Trade‑offs and cost considerations

The edge approach introduces two new cost dimensions:

1. **Lambda@Edge invocation fees** – $0.00000625 per request plus data transfer. At 10 k RPS, that translates to roughly $1.5 K per month, a fraction of the $12 K we spent on provisioned concurrency for the same traffic.
2. **CloudFront data transfer** – Because the edge function forwards the request to the origin, the payload travels twice (viewer→edge, edge→origin). However, the payload is under 1 KB, so the additional transfer cost stays below $200 per month.

The biggest trade‑off is operational visibility. CloudWatch metrics for Lambda@Edge are less granular than regional Lambda metrics; you must rely on CloudFront logs and custom metrics injected from the edge function. I mitigated this by emitting a `custom:edgeLatency` metric via the `aws-cloudwatch-sdk` from the edge runtime.

If your function exceeds 50 MB or requires native binaries that are not supported at the edge, this pattern breaks down. In those cases, consider *regional* edge caches (e.g., using ALB + NLB) or refactoring the function into a thin wrapper that delegates heavy work, as demonstrated above.

---

## Actionable steps you can take this week →

1. Identify any Lambda‑based API that serves a geographically diverse user base.
2. Measure the regional traffic split using CloudWatch *RequestCount* per region.
3. Deploy a minimal Lambda@Edge wrapper that forwards to the existing origin Lambda.
4. Run a short load test (e.g., with Artillery) focusing on the 99th‑percentile.
5. Compare latency and cost; if the edge layer improves the tail by >20 % and stays within budget, promote the change to production.

By moving the warm‑environment guarantee to the edge, I turned a flaky latency profile into a predictable, low‑tail service without abandoning provisioned concurrency for the heavy lifting. The pattern is repeatable for any API where the request payload is small and the business logic can be split into a thin edge shim and a provisioned‑concurrency backend.
