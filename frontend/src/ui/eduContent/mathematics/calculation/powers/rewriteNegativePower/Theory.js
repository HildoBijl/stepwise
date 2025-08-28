import { Translation } from 'i18n'
import { Head, Par, Term, M, BM, Warning } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>We know that a power is a repeated multiplication: <M>2^3</M> can also <SkillLink skillId="rewritePower">be written</SkillLink> as <M>2 \cdot 2 \cdot 2</M>. But what could <M>2^(-3)</M> be?</Par>
		</Translation>

		<Translation entry="idea">
			<Head>The meaning of a negative exponent</Head>
			<Par>Let's do a thought experiment. Let's say we start with the number <M>2^2</M>, which we can write as <M>2 \cdot 2</M>. If we multiply this again by <M>2</M>, we get <M>2 \cdot 2 \cdot 2</M> which is <M>2^3</M>. And if we do so again, we get <M>2 \cdot 2 \cdot 2 \cdot 2</M> which is <M>2^4</M>. Every time we multiply our number by the base <M>2</M>, the exponent increases by one!</Par>
			<Par>Next, let's reverse this. We start with <M>2^4 = 2 \cdot 2 \cdot 2 \cdot 2</M> and divide by <M>2</M>. When we do, a factor <M>2</M> cancels out and we are left with <M>2^3 = 2 \cdot 2 \cdot 2</M>. If we do this again, we get <M>2^2 = 2 \cdot 2</M>. Once more gives <M>2^1 = 2</M>. Note that a number to the power of one is simply itself. And if we divide by two again, we get <M>2^0 = 1</M>. A number to the power of zero always equals one.</Par>
			<Par>What if we continue this pattern? If we divide by two again, the exponent reduces further, and we have <M>2^(-1) = \frac(1)(2)</M>. Dividing by two again turns this into <M>2^(-2) = \frac(1/2)(2) = \frac(1)(2 \cdot 2) = \frac(1)(2^2)</M>. Note that we have <SkillLink skillId="multiplyDivideFractions">rewritten the fraction of fractions</SkillLink>. Dividing by two again gives <M>2^(-3) = \frac(1)(2 \cdot 2 \cdot 2) = \frac(1)(2^3)</M>. Based on this, we see a pattern on what a negative exponent actually means.</Par>
		</Translation>

		<Translation entry="rule">
			<Head>The rule</Head>
			<Par>In general, we see that a negative exponent like <M>2^(-3)</M> is exactly the same as a fraction <M>\frac(1)(2^3)</M>. More generally, for any numbers <M>a</M> and <M>b</M> we have <BM>a^(-b) = \frac(1)(a^b).</BM> Since fractions are usually easier to work with than negative exponents, it is usually wise, when you encounter a negative exponent, to directly rewrite is as a fraction. However, there are cases where the opposite is beneficial too.</Par>
			<Warning>The terminology here is sometimes a bit confusing. In the expression <M>2^(-3)</M> it is the <Term>exponent</Term> that is negative. However, in basic speech people sometimes also call this a negative <Term>power</Term>. This is due to the ambiguous use of the word "power" which sometimes refers to the exponent and sometimes to the whole thing. So when we say a negative power, we usually don't mean a power that's negative like <M>-2^3</M>, but we mean a power with a negative exponent like <M>2^(-3)</M>.</Warning>
		</Translation>
	</>
}
