'use strict';

var react = require('react');

const useStore = (store, changes = null) => {
  const [state, update] = react.useState(store.readState());
  react.useEffect(() => store.subscribe((next, _, changedProps) => {
    if (changes !== null) {
      if (changes.length === 0) {
        return;
      }

      const changeIndexes = changes.map(prop => changedProps.indexOf(prop));

      if (changeIndexes.some(i => i !== -1) === false) {
        return;
      }
    }

    update(next);
  }), []);
  return state;
};

module.exports = useStore;
