// Color mapping: customize color names to specific hex values
const COLOR_MAP = {
  red: "#EF5350", // Brighter red instead of default dark red (#ff0000)
  green: "#66BB6A", // Standard green
  pink: "#EC407A", // Bright pink
  orange: "#FF8026", // Vibrant orange
  purple: "#AB47BC", // Rich purple
  gray: "#BDBDBD", // Medium gray
  brown: "#8D6E63", // Earthy brown
  darkred: "#C03535", // Dark red
  blue: "#42A5F5", // Bright blue
  darkblue: "#5649F5", // Dark blue
  cyan: "#00E2EF", // Bright cyan
  gold: "#FFB000", // Golden yellow
  yellow: "#FFEE58", // Bright yellow
  brightyellow: "#FFE930", // Very bright yellow
};

// Normalize color value: if it's a known color name, use the mapped value
function normalizeColor(colorValue) {
  const trimmed = colorValue.trim().toLowerCase();
  return COLOR_MAP[trimmed] || colorValue.trim();
}

function replaceFontColor(text) {
  text ||= "";
  let previousText;

  do {
    previousText = text;
    text = text.replace(
      /\[color=([^\]]+)\]((?:(?!\[color=[^\]]+\]|\[\/color\])[\S\s])*)\[\/color\]/gi,
      (_, p1, p2) => `<span style='color:${normalizeColor(p1)}'>${p2}</span>`
    );
  } while (text !== previousText);

  return text;
}

function replaceFontBgColor(text) {
  text ||= "";
  let previousText;

  do {
    previousText = text;
    text = text.replace(
      /\[bgcolor=([^\]]+)\]((?:(?!\[bgcolor=[^\]]+\]|\[\/bgcolor\])[\S\s])*)\[\/bgcolor\]/gi,
      (_, p1, p2) => `<span style='background-color:${normalizeColor(p1)}'>${p2}</span>`
    );
  } while (text !== previousText);

  return text;
}

export function setup(helper) {
  helper.allowList({
    custom(tag, name, value) {
      if (tag === "span" && name === "style") {
        return /^(background-)?color:#?[a-zA-Z0-9]+$/.exec(value);
      }
    },
  });

  helper.registerOptions((opts) => {
    opts.features["bbcode-color"] = true;
  });

  if (helper.markdownIt) {
    helper.registerPlugin((md) => {
      const ruler = md.inline.bbcode.ruler;

      ruler.push("bgcolor", {
        tag: "bgcolor",
        wrap: function (token, endToken, tagInfo) {
          token.type = "span_open";
          token.tag = "span";
          token.attrs = [
            ["style", "background-color:" + normalizeColor(tagInfo.attrs._default)],
          ];
          token.content = "";
          token.nesting = 1;

          endToken.type = "span_close";
          endToken.tag = "span";
          endToken.nesting = -1;
          endToken.content = "";
        },
      });

      ruler.push("color", {
        tag: "color",
        wrap: function (token, endToken, tagInfo) {
          token.type = "span_open";
          token.tag = "span";
          token.attrs = [["style", "color:" + normalizeColor(tagInfo.attrs._default)]];
          token.content = "";
          token.nesting = 1;

          endToken.type = "span_close";
          endToken.tag = "span";
          endToken.nesting = -1;
          endToken.content = "";
        },
      });
    });
  } else {
    helper.addPreProcessor((text) => replaceFontColor(text));
    helper.addPreProcessor((text) => replaceFontBgColor(text));
  }
}
