import SwiftUI

struct FeedView: View {
    private let drops = SampleData.feed
    private let older: [(date: String, title: String, tag: String, duration: String)] = [
        ("Aug 24", "NVIDIA earnings beat", "AI",     "2:04"),
        ("Aug 23", "OpenAI ship day",      "AI",     "1:58"),
        ("Aug 22", "Housing starts drop",  "MACRO",  "1:37"),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if let latest = drops.first {
                    NavigationLink(value: latest) {
                        FeedHeroCard(drop: latest)
                    }
                    .buttonStyle(.plain)
                }

                Text("Recent drops")
                    .font(.system(.caption2, design: .monospaced))
                    .tracking(1.4)
                    .foregroundStyle(.secondary)

                VStack(spacing: 0) {
                    ForEach(older, id: \.title) { row in
                        FeedRow(date: row.date, title: row.title, tag: row.tag, duration: row.duration)
                        Divider().padding(.leading, 54)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
        }
        .navigationTitle("Today")
        .toolbar {
            Button { } label: { Image(systemName: "gearshape") }
        }
        .navigationDestination(for: Drop.self) { drop in
            PlayerView(drop: drop)
        }
    }
}

private struct FeedHeroCard: View {
    let drop: Drop

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 8)
                    .fill(LinearGradient(colors: [Color(white: 0.36), Color(white: 0.16)],
                                         startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(height: 160)
                    .overlay {
                        Image(systemName: "play.fill")
                            .font(.system(size: 34))
                            .foregroundStyle(.white)
                    }

                Text("LIVE · 2 HRS AGO")
                    .font(.system(.caption2, design: .monospaced))
                    .tracking(1.2)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Color.white.opacity(0.16))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 4))
                    .padding(10)
            }

            Text(drop.title)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(.white)

            Text("\(drop.durationLabel) · \(drop.summary.count) stories")
                .font(.system(size: 12))
                .foregroundStyle(.white.opacity(0.72))
        }
        .padding(12)
        .background(Color(red: 0.16, green: 0.15, blue: 0.14))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

private struct FeedRow: View {
    let date: String
    let title: String
    let tag: String
    let duration: String

    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(white: 0.85))
                .frame(width: 44, height: 44)
                .overlay {
                    Image(systemName: "play.fill")
                        .foregroundStyle(Color(white: 0.35))
                        .font(.system(size: 12))
                }

            VStack(alignment: .leading, spacing: 3) {
                Text(title).font(.system(size: 14, weight: .medium))
                HStack(spacing: 6) {
                    Text(tag)
                        .font(.system(.caption2, design: .monospaced))
                        .tracking(1.0)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 1)
                        .background(Color.orange.opacity(0.14))
                        .foregroundStyle(.orange)
                        .clipShape(RoundedRectangle(cornerRadius: 3))
                    Text("\(date) · \(duration)")
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    NavigationStack { FeedView() }
}
