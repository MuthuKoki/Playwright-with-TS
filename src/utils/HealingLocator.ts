import { test, type Locator } from '@playwright/test';

export const HEALED_ANNOTATION = 'self-healed-locator';
/** Marks tests that heal on purpose (the healing demo specs) so CI doesn't flag them. */
export const EXPECTED_HEAL_ANNOTATION = 'expected-heal';

interface ActionOptions {
  timeout?: number;
}

/** Set SELF_HEALING=false to disable fallbacks, e.g. to prove the primary locators still work. */
export const selfHealingEnabled = (process.env.SELF_HEALING ?? 'true').toLowerCase() !== 'false';

/**
 * A locator with ordered fallbacks for critical elements.
 *
 * Actions wait until *any* candidate is visible, then use the first candidate that matches.
 * If that isn't the primary, the test keeps going but the heal is recorded as a test annotation
 * (shown in the HTML report and CI summary), so a broken locator gets fixed instead of hidden.
 */
export class HealingLocator {
  private readonly candidates: Locator[];

  constructor(
    private readonly name: string,
    private readonly primary: Locator,
    fallbacks: Locator[],
    private readonly enabled = selfHealingEnabled,
  ) {
    this.candidates = enabled ? [primary, ...fallbacks] : [primary];
  }

  /** A combined locator for web-first assertions (`expect(...).toBeVisible()`); it never reports heals. */
  get locator(): Locator {
    return this.candidates.reduce((combined, next) => combined.or(next));
  }

  async resolve(options: ActionOptions = {}): Promise<Locator> {
    if (!this.enabled) return this.primary;

    await this.locator.first().waitFor({ state: 'visible', ...options });
    for (const [index, candidate] of this.candidates.entries()) {
      if ((await candidate.count()) === 0) continue;
      if (index > 0) this.reportHeal(candidate);
      return candidate;
    }
    // Unreachable unless the DOM changed between the wait and the lookup.
    return this.primary;
  }

  async click(options: ActionOptions = {}): Promise<void> {
    await (await this.resolve(options)).click(options);
  }

  async fill(value: string, options: ActionOptions = {}): Promise<void> {
    await (await this.resolve(options)).fill(value, options);
  }

  private reportHeal(used: Locator): void {
    const description = `${this.name}: primary ${this.primary} not found, healed with ${used}`;
    test.info().annotations.push({ type: HEALED_ANNOTATION, description });
    console.warn(`[self-healing] ${description}`);
  }
}
