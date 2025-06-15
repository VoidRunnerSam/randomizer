# Sam's Randomizer

A simple web-based `json` randomizer and preset editor. Upload your own `.json` file, modify category weights, and generate random selections based on those weights!

## 🌐 Live Link

[https://voidrunnersam.github.io/randomizer/](https://voidrunnersam.github.io/randomizer/)

## 🚀 Features

- Upload `.json` files using the [specified json formatting](#-json-format)
- Enable/disable specific categories
- Modify weights via sliders
- Add/remove your own categories and options
- Download your preset to share with others
- Client-side (no telemetry or data sharing)
- Mobile-friendly
- Open-source

## 🧮 JSON Format

Your input JSON file should follow this structure and logic:

- weight value between `0 and 20` (I am bad at coding and didnt add good logic)
- less than `250,000` total lines (for wide compatability on lower ram devices)

```json
{
  "Category 1": {
    "Option A": { "weight": 5 },
    "Option B": { "weight": 10 }
  },
  "Category 2": {
    "Option X": { "weight": 3 },
    "Option Y": { "weight": 7 }
  }
}
```

## 🛣️ Roadmap

### High Priority

- add logic for custom weights and bad weight values
- add preset loading from the folder so you dont **need** to download anything and can use the presets

### Medium Priority

- custom color themes with local storage use
- fix any exploits found **(will be high priority when found)**

## ⚠️ Safety Notice

- Always verify any files you download before opening them
- All logic is fully client-side — no files are uploaded or stored externally

## 📄 License

MIT License — free to use, modify, or redistribute. Contributions welcome!

## Credits

- check the [commits](https://github.com/VoidRunnerSam/randomizer/commits/main/) to see what people have contributed!
- there is also the [issues](https://github.com/VoidRunnerSam/randomizer/issues) tab where people have reported anything wrong with the randomizer!