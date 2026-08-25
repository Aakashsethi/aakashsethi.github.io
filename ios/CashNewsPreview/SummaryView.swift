import SwiftUI

struct SummaryView: View {
    let drop: Drop

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Aug 25 · Daily brief")
                    .font(.system(.caption2, design: .monospaced))
                    .tracking(1.4)
                    .foregroundStyle(.secondary)

                Text(drop.title)
                    .font(.system(size: 22, weight: .semibold))
                    .lineLimit(3)

                VStack(alignment: .leading, spacing: 0) {
                    ForEach(Array(drop.summary.enumerated()), id: \.offset) { _, bullet in
                        HStack(alignment: .top, spacing: 10) {
                            Circle().fill(Color.orange).frame(width: 5, height: 5).padding(.top, 7)
                            Text(bullet).font(.system(size: 14)).foregroundStyle(.primary)
                        }
                        .padding(.vertical, 8)
                        Divider()
                    }
                }

                VStack(spacing: 6) {
                    Link(destination: drop.sourceURL) {
                        Text("Read full source")
                            .frame(maxWidth: .infinity)
                            .padding(10)
                            .background(Color(red: 0.11, green: 0.10, blue: 0.09))
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .font(.system(size: 13, weight: .semibold))
                    }
                    Button { } label: {
                        Text("Save for later")
                            .frame(maxWidth: .infinity)
                            .padding(10)
                            .foregroundStyle(.primary)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color(white: 0.82)))
                            .font(.system(size: 13, weight: .semibold))
                    }
                }
                .padding(.top, 8)
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

#Preview {
    NavigationStack { SummaryView(drop: SampleData.feed[0]) }
}
