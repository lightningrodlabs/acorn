#!/bin/bash

for var in "$@"; do
  echo "folder: web/src/components/$var"
  mkdir web/src/components/$var

  echo "scss: web/src/components/$var"
  touch web/src/components/$var/$var.scss

  echo "component: web/src/components/$var"
  touch web/src/components/$var/$var.tsx
  cat scripts/component-template/component.tsx >web/src/components/$var/$var.tsx
  sed -i.bak "s/ReplaceMe/$var/g" web/src/components/$var/$var.tsx
  rm web/src/components/$var/$var.tsx.bak

  echo "story: web/src/stories/$var.stories.tsx"
  touch web/src/stories/$var.stories.tsx
  cat scripts/component-template/component.stories.tsx >web/src/stories/$var.stories.tsx
  sed -i.bak "s/ReplaceMe/$var/g" web/src/stories/$var.stories.tsx
  rm web/src/stories/$var.stories.tsx.bak
done
