import { useEffect, useState } from 'react';

function About(props) {

	return (
	<div className="plain-content container">
	  <h3>About</h3>
	  <p><i>wordmage.app</i> is designed for a mobile device and is intended to serve two purposes. First, it contains a collection of several thousand off-the-beaten-path words that are more likely to hold recreational appeal for the logophile than to be of use in, say, boosting an SAT score. Second, it provides a tool ("Spotlight") for reviewing words you might want to note for particular attention. Such words need not be in the afore-mentioned list.</p>

	  <h4>Sources</h4>

	  <p><b>Luciferous Logolepsy</b> (RIP). Most of the words included here were taken, as far I can tell, from an online resource titled <i>Luciferous Logolepsy</i>, which no longer exists. Years ago&mdash;at least a decade, I should think&mdash;I created a database table of words and populated it with roughly 9,000 worthy specimens. I don't recall where I got the words, or how; however, when I compare entries with those at the <i>Cafe Arcane</i> (<i>arcane.org/luciferous-logolepsy/</i>), I find several convincing indications of a common source.</p>

	  <p>Since what I believe to have been my original source no longer exists, I feel more free than I otherwise might to use the list for my purposes here.</p>

	  <p><b>The Phrontistery</b>. Another longtime trove for the logophile is <i>The Phrontistery</i> (<i>phrontistery.info</i>). From this, I took the 412 entries within the group titled <i>Compendium of Lost Words</i>.</p>
	</div>
	);
}	

export default About;
