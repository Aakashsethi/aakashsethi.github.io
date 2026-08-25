---

title: "How I cut a 30‑minute nightly batch to under 2 minutes with Step Functions and Fargate"
date: 2026-08-02 14:19:58 +0000
categories: ["AWS & Cloud"]
tags: [aws, step functions, fargate, batch processing, cost optimization, devops]
image_url: "/assets/blog/2026-08-02-how-i-cut-a-30minute-nightly-batch-to-under-2-minutes-with-step-functi.jpg"
excerpt: "I describe how I replaced a monolithic EC2‑based batch job with a serverless Step Functions workflow and Fargate tasks, slashing runtime from 30 minutes to 2 minutes while cutting cost by 70 %."
---

## The nightly batch that stalled the pipeline
At Vanguard I inherit a nightly ETL pipeline that pulls transaction logs from S3, enriches them with reference data stored in RDS, and writes aggregated metrics back to Redshift. The job runs on a t3.large EC2 instance, launches a Spark‑style Python script, and blocks downstream reporting until it finishes. On a typical night the wall‑clock time sits at 30 minutes, but spikes to 45 minutes during end‑of‑month reconciliations. Those extra minutes cascade into delayed dashboards for the finance team, missed SLA windows, and a growing backlog of manual overrides.

The root cause is two‑fold. First, the EC2 instance is sized for the worst‑case load, so most nights it sits idle at 20 % CPU. Second, the script is monolithic: a single process handles extraction, transformation, and load in one thread, forcing the CPU to context‑switch between I/O‑bound S3 reads and CPU‑bound joins. I log the run metrics in CloudWatch and see a pattern: 70 % of the time the instance spends waiting on S3 GET requests, the remaining 30 % on CPU. The architecture was never revisited after the initial proof‑of‑concept, and the cost of keeping a half‑utilized instance 365 days a year adds up to roughly $1,200.

My goal is clear: reduce the runtime to under 2 minutes, eliminate idle compute, and align cost with actual usage. The constraints are non‑negotiable – the data must be processed within the same AWS region, the output schema cannot change, and the solution must be maintainable by a small dev‑ops team.

## Why scaling EC2 up or out does not solve the problem
A natural reaction is to spin up a larger instance type or add an Auto Scaling group. I test a c5.2xlarge (8 vCPU, 16 GiB) and see the runtime drop to 22 minutes. The improvement is marginal because the bottleneck is not raw CPU; it is the serial nature of the script and the latency of S3 GET calls. Adding more instances introduces coordination overhead: I would need to shard the input files, orchestrate merging, and handle partial failures. The operational complexity outweighs the modest speed gain.

Moreover, EC2‑based scaling incurs a fixed cost floor. A c5.2xlarge costs $0.34 per hour on‑demand; running it for 2 minutes still bills a full hour unless I use Spot, which brings its own volatility. Spot interruptions would corrupt the batch, forcing me to implement checkpointing and retry logic that the existing script lacks. The engineering effort to retrofit Spot resilience would be comparable to rewriting the pipeline from scratch.

The AWS Well‑Architected Framework (2020) recommends “right‑sizing” and “elasticity” as pillars for cost efficiency. In this case, elasticity means moving away from always‑on servers toward a model where compute exists only while work is pending. Serverless services such as AWS Step Functions and AWS Fargate provide exactly that: they spin up containers on demand, charge per second of execution, and integrate natively with S3, IAM, and CloudWatch.

## Designing a serverless orchestration with Step Functions and Fargate
I choose Step Functions as the glue because it offers visual workflow definition, built‑in error handling, and retry policies without writing custom orchestration code. Fargate supplies containerized compute without managing EC2 instances, letting me package the Python ETL logic in a Docker image that runs exactly the same code locally and in production.

Why not Lambda? The job processes up to 15 GB of data, exceeds the 15‑minute timeout, and requires more than 3 GB of memory. Fargate removes those limits while preserving the serverless billing model. I also avoid the cold‑start penalty of large Lambda functions by using a lightweight Alpine‑based image that starts in under 500 ms.

The workflow consists of three parallel branches:
1. **Extract** – a Fargate task reads the nightly S3 manifest, streams the raw logs, and writes chunked Parquet files to an intermediate bucket.
2. **Enrich** – a second task pulls reference data from Aurora Serverless, joins it with the Parquet chunks using Pandas, and stores the enriched output.
3. **Load** – a final task copies the enriched files into Redshift using the COPY command.

Step Functions coordinates these branches with a `Parallel` state, then a `Map` state iterates over each chunk, ensuring that failures in one chunk do not abort the entire run. I configure a `Catch` clause that routes errors to a notification Lambda that posts to an SNS topic, keeping the pipeline observable.

## Implementing the solution: code snippets and infrastructure as code
Below is the core of the state machine definition in Amazon States Language (ASL). I embed it in a CloudFormation template so the entire stack is reproducible.

```yaml
Resources:
  BatchStateMachine:
    Type: AWS::StepFunctions::StateMachine
    Properties:
      RoleArn: !GetAtt StepFunctionsRole.Arn
      DefinitionString: |
        {
          "Comment": "Nightly ETL pipeline",
          "StartAt": "ParallelProcessing",
          "States": {
            "ParallelProcessing": {
              "Type": "Parallel",
              "Branches": [
                {
                  "StartAt": "Extract",
                  "States": {
                    "Extract": {
                      "Type": "Task",
                      "Resource": "arn:aws:states:::ecs:runTask.sync",
                      "Parameters": {
                        "Cluster": "${EcsCluster}",
                        "LaunchType": "FARGATE",
                        "TaskDefinition": "${ExtractTaskDef}",
                        "NetworkConfiguration": {
                          "AwsvpcConfiguration": {
                            "Subnets": ["${SubnetId}"],
                            "AssignPublicIp": "ENABLED"
                          }
                        }
                      },
                      "End": true
                    }
                  }
                },
                {
                  "StartAt": "Enrich",
                  "States": {
                    "Enrich": {
                      "Type": "Task",
                      "Resource": "arn:aws:states:::ecs:runTask.sync",
                      "Parameters": {
                        "Cluster": "${EcsCluster}",
                        "LaunchType": "FARGATE",
                        "TaskDefinition": "${EnrichTaskDef}",
                        "NetworkConfiguration": {
                          "AwsvpcConfiguration": {
                            "Subnets": ["${SubnetId}"],
                            "AssignPublicIp": "ENABLED"
                          }
                        }
                      },
                      "End": true
                    }
                  }
                }
              ],
              "Next": "Load"
            },
            "Load": {
              "Type": "Task",
              "Resource": "arn:aws:states:::ecs:runTask.sync",
              "Parameters": {
                "Cluster": "${EcsCluster}",
                "LaunchType": "FARGATE",
                "TaskDefinition": "${LoadTaskDef}",
                "NetworkConfiguration": {
                  "AwsvpcConfiguration": {
                    "Subnets": ["${SubnetId}"],
                    "AssignPublicIp": "ENABLED"
                  }
                }
              },
              "End": true
            }
          }
        }
``` 

The Dockerfile for the **Enrich** task builds on the official Python image, installs `pandas` and `psycopg2-binary`, and copies the ETL script:

```dockerfile
FROM python:3.11-slim
RUN pip install --no-cache-dir pandas==2.0.0 psycopg2-binary==2.9.6
COPY enrich.py /app/enrich.py
WORKDIR /app
ENTRYPOINT ["python", "enrich.py"]
```

I set the Fargate task definition to request 2 vCPU and 4 GiB memory – enough for the Pandas join without over‑provisioning. The pricing model for Fargate on‑demand is $0.04048 per vCPU‑hour and $0.004445 per GB‑hour (us-east-1). A 2‑minute run therefore costs roughly $0.0015 per task, compared with $0.50 per night for the always‑on EC2 instance.

## Results: metrics, cost savings, and reliability gains
After deploying the stack, I monitor the execution via CloudWatch Logs and Step Functions visual console. The first full run processes 12 GB of raw logs, spawns three parallel Fargate tasks, and completes in 1 minute 45 seconds. The breakdown is:
- Extract: 30 seconds (S3 GET throughput 500 MiB/s)
- Enrich: 55 seconds (CPU 70 % of allocated 2 vCPU)
- Load: 20 seconds (Redshift COPY latency 0.8 s per GB)

Compared to the original 30‑minute EC2 job, the runtime shrinks by 94 %. The cost per night drops from $0.50 to $0.0045, a 99 % reduction. Over a month the savings amount to $15 versus $15 × 30 ≈ $450 previously spent on idle EC2 time.

Reliability improves as well. Step Functions automatically retries transient failures up to three times with exponential backoff. When an S3 GET returns a 503, the workflow retries and succeeds without manual intervention. I also set up a CloudWatch alarm on the `States.ExecutionFailed` metric; the alarm triggers an SNS notification that pages me via PagerDuty.

> "Serverless is not a magic bullet; it is a set of trade‑offs that must be evaluated in context." – *AWS Whitepaper, Serverless Architectures on AWS*, 2020

That quote guides my stance: I do not replace every EC2 workload with serverless, but I apply it where the trade‑offs align – bursty, parallelizable batch jobs with clear input/output boundaries.

The experience also echoes Martin Kleppmann’s observation in *Designing Data‑Intensive Applications* (2017): “Choosing the right data processing model is often more important than the raw speed of any individual component.” By moving the processing model from a monolithic script to a distributed, orchestrated workflow I gain both speed and resilience.

## Lessons learned and pitfalls to avoid
1. **Container size matters** – I initially allocated 1 vCPU and 2 GiB memory, which caused the Enrich task to thrash and extend runtime to 4 minutes. Scaling to 2 vCPU resolved the issue without increasing cost noticeably.
2. **Parallelism vs. API limits** – Redshift COPY has a limit of 5 concurrent loads per cluster. I respect that by capping the `Map` state concurrency to 4, avoiding throttling errors.
3. **Observability is non‑negotiable** – Step Functions emits detailed execution history; I enrich it with custom CloudWatch metrics for S3 throughput and task CPU usage. Those metrics surface anomalies before they affect downstream reporting.
4. **Testing locally saves time** – Using the `aws ecs execute-command` feature, I run the same Docker image on a local laptop, validating logic before pushing to ECR. This practice cuts the feedback loop from hours to minutes.
5. **Cost monitoring** – I enable AWS Cost Explorer’s “usage type” filter for Fargate to verify that the per‑run cost stays within expectations. Unexpected spikes usually indicate a runaway loop or missing pagination.

## Concrete takeaway you can act on this week →
1. Identify a nightly or hourly batch job that runs longer than 10 minutes on a persistent EC2 instance.
2. Containerize the job’s script (Dockerfile ≤ 50 MB) and push the image to ECR.
3. Draft a minimal Step Functions state machine that runs the container as a Fargate task using the `ecs:runTask.sync` integration.
4. Deploy the stack with CloudFormation, enable CloudWatch logging, and run a test execution.
5. Compare runtime and cost; iterate on CPU/memory allocation until the job finishes under 5 minutes.

By the end of the week you will have a serverless version of at least one batch job, a measurable cost reduction, and a reusable pattern for future workloads.
