import cssColors from "css-color-names";
import randomFlatColors from "random-flat-colors";
import camelcase from "camelcase";

const getColourFromTag = ({ color } = {}) => {
  if (!color) {
    return randomFlatColors();
  }

  const getColorFromCss = name => cssColors[name];

  const getColorFromCssBackup = name =>
    getColorFromCss(name.replace("dark", "").replace("light", ""));

  const name = camelcase(color).toLowerCase();

  return (
    getColorFromCss(name) || getColorFromCssBackup(name) || randomFlatColors()
  );
};

export { getColourFromTag };
