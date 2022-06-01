# Ideograph Editor for Iframe Embedding

## Configure

可以通过修改 `static/databaseConfiguration.json` 下的内容控制显示的数据库名字（没有其他作用）。


## Build

#### 打包
```shell
npm run build
```

#### 后处理
```shell
kotlin post-process.kts
```
后处理用于去除 html 内多余的斜杠，并把 `static/databaseConfiguration.json` 复制到打包的文件夹内。

或者使用 `npm run build!` 一次性完成上面两个命令。