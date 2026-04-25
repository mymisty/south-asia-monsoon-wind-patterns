# NASA 底图来源

本目录中的南亚底图裁自 NASA Blue Marble Next Generation 月度全球影像。

- 数据源：NASA Blue Marble Next Generation
- 官方页面：<https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/>
- 下载源：NASA NEO Blue Marble archive
  - 1月：<https://neo.gsfc.nasa.gov/archive/bluemarble/bmng/world_8km/world.topo.200401.3x5400x2700.jpg>
  - 7月：<https://neo.gsfc.nasa.gov/archive/bluemarble/bmng/world_8km/world.topo.200407.3x5400x2700.jpg>
- 投影方式：Mercator 重新采样，避免把经纬矩形强行拉伸成 16:9
- 地图范围：约经度 33.09°E 到 116.91°E，纬度 6°S 到 38°N
- 输出尺寸：1600 × 900，适配 16:9 课堂展示与 PPT

生成文件：

- `south-asia-nasa-winter.jpg`
- `south-asia-nasa-summer.jpg`

说明：NASA Blue Marble 是全球真实影像合成底图，适合用作教学示意底图；本项目在其上叠加风向、气压、降水和地形解释图层。
