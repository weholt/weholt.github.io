export function articleIdFromPhotoId(photoId: string): string | undefined {
  const match = photoId.match(/^(.+)-(\d{3})$/);
  return match?.[1];
}

export const NON_PHOTOGRAPHY_ARTICLE_IDS = new Set([
  "upgrading-postgresql-docker",
  "thomas-python-true"
]);
