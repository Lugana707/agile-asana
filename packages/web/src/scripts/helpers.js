import pluralise from "pluralise";

const pluraliseText = ({ name, count }) => {
  const nameLowerCase = name.toLowerCase();

  if (nameLowerCase.endsWith("ed")) {
    return name;
  }

  if (nameLowerCase.endsWith("s") && count !== 1) {
    return `${name}'`;
  }

  return pluralise(count, name);
};

export { pluraliseText };
