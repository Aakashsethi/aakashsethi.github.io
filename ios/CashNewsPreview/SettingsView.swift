import SwiftUI

struct SettingsView: View {
    @AppStorage("source.bloomberg") private var bloomberg = true
    @AppStorage("source.reuters")   private var reuters   = true
    @AppStorage("source.wsj")       private var wsj       = false
    @AppStorage("notif.dailyTime")  private var dailyTime = "9:00 AM ET"
    @AppStorage("notif.breaking")   private var breaking  = false
    @AppStorage("voice.id")         private var voiceId   = "ElevenLabs · Rachel"

    var body: some View {
        Form {
            Section("Sources") {
                Toggle("Bloomberg", isOn: $bloomberg)
                Toggle("Reuters",   isOn: $reuters)
                Toggle("WSJ",       isOn: $wsj)
            }
            Section("Notifications") {
                LabeledContent("Daily drop", value: dailyTime)
                Toggle("Breaking only", isOn: $breaking)
            }
            Section("Avatar voice") {
                NavigationLink(voiceId) { Text("Voice picker (stub)") }
            }
            Section {
                Link("Open pipeline repo", destination: URL(string: "https://github.com/Aakashsethi/CashNews")!)
                Link("Open iOS repo",      destination: URL(string: "https://github.com/Aakashsethi/CashNewsIOS")!)
            }
        }
        .navigationTitle("Settings")
        .tint(.orange)
    }
}

#Preview {
    NavigationStack { SettingsView() }
}
