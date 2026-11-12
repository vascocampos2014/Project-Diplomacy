// Icons load their font asynchronously, which only produces act() noise in
// tests. A plain element keeps the icon's name for assertions.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Icon = ({ name }: { name: string }) => React.createElement(Text, { testID: `icon-${name}` }, '');
  return { MaterialIcons: Object.assign(Icon, { glyphMap: {} }) };
});
