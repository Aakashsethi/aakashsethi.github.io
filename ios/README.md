# CashNews iOS — SwiftUI wireframe

Skeleton SwiftUI views that mirror the browser preview at
[/ios-preview/](https://aakashsethi.github.io/ios-preview/). Not a
shipping app yet — just the view hierarchy, sample data, and
navigation shape.

```
ios/CashNewsPreview/
  CashNewsPreviewApp.swift   Entry point + tab shell
  Model.swift                Drop / Transcript / SampleData
  FeedView.swift             Landing screen — hero + list
  PlayerView.swift           Video panel + tap-to-jump transcript
  SummaryView.swift          Bulleted daily brief + CTAs
  SettingsView.swift         Sources / notifications / voice
```

Open the folder in Xcode 15+ as a Swift package or drop the files into
an app target. Each view has an `#Preview` block so canvases work
without a full build.
