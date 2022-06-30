import typescript from "@rollup/plugin-typescript";
import pkg from './package.json'
export default {
  input: './src/index.ts',
  output: [
    //cjs代表commonjs规范文件
    //esm代表es6模块规范文件
    {
      file: pkg.main,    // 必须
      format: 'cjs',  // 必须
    },
    {
      file: pkg.module,    // 必须
      format: 'esm',  // 必须
    },
  ],
  //使用ts编写的代码，需要ts插件
  plugins: [typescript()],
};