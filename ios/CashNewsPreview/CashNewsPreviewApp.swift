// CashNews iOS companion — SwiftUI skeleton
//
// Mirrors the four-screen wireframe at
// https://aakashsethi.github.io/ios-preview/. Not shipped to the App
// Store yet; the browser preview page is the source of truth for
// visual design.

import SwiftUI

@main
struct CashNewsPreviewApp: App {
    var body: some Scene {
        WindowGroup {
            RootTabView()
        }
    }
}

struct RootTabView: View {
    var body: some View {
        TabView {
            NavigationStack { FeedView() }
                .tabItem { Label("Feed", systemImage: "square.stack") }
            NavigationStack { SettingsView() }
                .tabItem { Label("Settings", systemImage: "gearshape") }
        }
        .tint(.orange)
    }
}
