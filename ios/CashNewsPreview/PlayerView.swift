import SwiftUI

struct PlayerView: View {
    let drop: Drop
    @State private var elapsed: TimeInterval = 47

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                PlayerVideoPanel(drop: drop, elapsed: elapsed)

                Text(drop.title)
                    .font(.system(size: 17, weight: .semibold))

                Text("Transcript · tap to jump")
                    .font(.system(.caption2, design: .monospaced))
                    .tracking(1.4)
                    .foregroundStyle(.secondary)

                VStack(alignment: .leading, spacing: 0) {
                    ForEach(Array(drop.transcript.enumerated()), id: \.offset) { i, line in
                        Button {
                            elapsed = line.start
                        } label: {
                            HStack(alignment: .top, spacing: 8) {
                                Text(String(format: "%02d:%02d", Int(line.start) / 60, Int(line.start) % 60))
                                    .font(.system(.caption2, design: .monospaced))
                                    .foregroundStyle(.tertiary)
                                    .frame(width: 40, alignment: .leading)
                                Text(line.text)
                                    .font(.system(size: 13))
                                    .foregroundStyle(elapsed >= line.start && (i + 1 >= drop.transcript.count || elapsed < drop.transcript[i + 1].start)
                                                     ? .primary : .secondary)
                                Spacer(minLength: 0)
                            }
                            .padding(.vertical, 6)
                        }
                        .buttonStyle(.plain)
                        Divider()
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            Button { } label: { Image(systemName: "square.and.arrow.up") }
        }
    }
}

private struct PlayerVideoPanel: View {
    let drop: Drop
    let elapsed: TimeInterval

    private var progress: CGFloat {
        CGFloat(elapsed) / CGFloat(max(drop.durationSeconds, 1))
    }

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "person.fill")
                .font(.system(size: 68))
                .foregroundStyle(Color(white: 0.7))
                .frame(maxWidth: .infinity)
                .frame(height: 180)

            VStack(spacing: 6) {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(Color.white.opacity(0.2))
                        Capsule().fill(Color.white).frame(width: geo.size.width * progress)
                    }
                }
                .frame(height: 3)

                HStack {
                    Text(timeLabel(elapsed))
                    Spacer()
                    Text(drop.durationLabel)
                }
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(.white)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(Color(red: 0.11, green: 0.10, blue: 0.09))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func timeLabel(_ t: TimeInterval) -> String {
        String(format: "%d:%02d", Int(t) / 60, Int(t) % 60)
    }
}

#Preview {
    NavigationStack { PlayerView(drop: SampleData.feed[0]) }
}
