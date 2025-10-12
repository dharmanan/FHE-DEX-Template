import inject from '@rollup/plugin-inject';

export default {
  plugins: [
    inject({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
