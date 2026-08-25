import Foundation

// Shape of drops.json produced by the CashNews pipeline at publish time.
// The app pulls a single signed URL and caches locally.
struct Drop: Identifiable, Codable, Hashable {
    let id: String            // e.g. "2026-08-25"
    let title: String
    let publishedAt: Date
    let durationSeconds: Int
    let videoURL: URL
    let posterURL: URL
    let tag: String           // MACRO, AI, MARKETS, …
    let summary: [String]     // 3–5 bullets
    let transcript: [Transcript]
    let sourceURL: URL
}

struct Transcript: Codable, Hashable {
    let start: TimeInterval
    let text: String
}

extension Drop {
    var durationLabel: String {
        let m = durationSeconds / 60
        let s = durationSeconds % 60
        return String(format: "%d:%02d", m, s)
    }
}

// Preview / wireframe fixture data — matches the browser mockup so the
// two stay in sync visually.
enum SampleData {
    static let feed: [Drop] = [
        .init(id: "2026-08-25", title: "Fed signals cut, markets rally",
              publishedAt: .now.addingTimeInterval(-7_200),
              durationSeconds: 124,
              videoURL: URL(string: "https://cdn.cashnews.example/2026-08-25.mp4")!,
              posterURL: URL(string: "https://cdn.cashnews.example/2026-08-25.jpg")!,
              tag: "MACRO",
              summary: [
                "Fed minutes hint at a September rate cut — first since 2023.",
                "CPI came in at 2.3%, below the 2.5% consensus.",
                "Bond yields dropped 12bps on the news; equities rallied.",
                "\"The disinflation trend is now durable.\" — Fed Chair Powell.",
              ],
              transcript: [
                .init(start: 0,  text: "The Fed just gave us the clearest signal yet."),
                .init(start: 7,  text: "Rate cuts back on the table for September."),
                .init(start: 14, text: "Markets priced in three cuts by year-end."),
                .init(start: 22, text: "Here's the twist nobody's talking about."),
              ],
              sourceURL: URL(string: "https://www.federalreserve.gov/")!),
    ]
}
