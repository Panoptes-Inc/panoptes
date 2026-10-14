# Panoptes Dummy Seed Readme v1.1 Mapping Aligned

## 目的
この版は `Panoptes Display Metrics Mapping Spec v1.0` に合わせて、
ダミーデータのキー名と意味を UI メトリクスに1対1対応させた版です。

## 主な変更
- `overallScore` などの表示値はそのまま残しつつ、意味が曖昧なキーを整理
- `strategicFitScore` / `industryUiConfidencePercent` / `riskSeverityLabel` など、
  画面表示と数式マッピングが追いやすいキー名に変更
- `projectList.items` / `analysisFlow.visibleStepItems` など、
  画面単位で参照しやすい構造へ再編
- `feedViewPlaceholder.eventItems` など、将来画面とも整合する名前へ調整

## 推奨運用
- 正本: `panoptes_dummy_seed_v1_1_mapping_aligned.json`
- 補助: `panoptes_dummy_seed_v1_1_mapping_aligned.ts`
- 旧 `panoptes_dummy_seed_v1.json` は比較用に残してもよいが、今後の実装基準は v1.1 を推奨

## Codex への渡し方
1. v1.1 mapping aligned JSON を source of truth として使う
2. UI 表示値は Display Metrics Mapping Spec v1.0 と照合する
3. dummy key の意味を変えずに実 API へ寄せる
4. backend mode では silent fallback に使わない
