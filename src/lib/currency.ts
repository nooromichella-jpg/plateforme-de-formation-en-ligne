/**
 * Utilitaire de gestion et de formatage de la monnaie Ariary (Ar) de Madagascar pour SkillHub.
 * Emplacement: src/lib/currency.ts
 */

/**
 * Normalise un prix en Ariary.
 * Si un cours possède encore un prix historique inférieur à 1000 (ex: 49.99 €),
 * il est automatiquement converti en équivalent Ariary cohérent (~5 000 Ar / € arrondi).
 */
export function getAriaryAmount(price: number | undefined | null): number {
  if (price === undefined || price === null || isNaN(price) || price <= 0) {
    return 0;
  }
  // Si le montant est inférieur à 1000, c'est un ancien prix en euros à convertir
  if (price < 1000) {
    return Math.round((price * 5000) / 1000) * 1000;
  }
  return Math.round(price);
}

/**
 * Formate un montant en Ariary avec séparateur de milliers et le symbole "Ar".
 * Exemple: 250000 -> "250 000 Ar"
 * Exemple: 0 -> "Gratuit" (ou "0 Ar" si showZeroAsGratuit = false)
 */
export function formatPrice(price: number | undefined | null, showZeroAsGratuit: boolean = true): string {
  const amount = getAriaryAmount(price);
  if (amount === 0 && showZeroAsGratuit) {
    return 'Gratuit';
  }
  return `${amount.toLocaleString('fr-FR')} Ar`;
}

/**
 * Formate un montant brut avec suffixe "Ar".
 * Exemple: 250000 -> "250 000 Ar"
 */
export function formatAriaryAmount(price: number | undefined | null): string {
  const amount = getAriaryAmount(price);
  return `${amount.toLocaleString('fr-FR')} Ar`;
}
