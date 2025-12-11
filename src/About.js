import { useEffect, useState } from 'react';

function About(props) {

	return (
	<div className="browse-container">
	  <div className="about-toolbar">
	    <div className="about-toolbar-title">About</div>
	  </div>
	  
	  <div className="about-content">
		  <p><i>wordmage.app</i> is designed for a mobile device and is intended as entertainment for word fanciers. It contains a collection of several thousand off-the-beaten-path words that are more likely to hold recreational appeal for the logophile than to be of practical use in building an everyday vocabulary.</p>
	      <p>There are several sections.</p>
	      <p>The <b>Browse</b> section contains all of the words in the collection, in dictionary order.</p>
	      <p>Each word entry includes a three-dot menu with options to favorite words you like, mark them for learning, discard them from view, or add tags for organizing your collection.</p>
	      <p>The <b>Favorites</b> list ... Yeah, you're wondering what that could be, aren't you?</p>
	      <p>The <b>Random</b> list is a random selection of words from the Browse list, but not arranged in any order. It's meant to give you a quick sampling of words you're not likely to have just seen and gotten bored with.</p>
	      <p>The <b>Learn</b> section contains words you've marked for learning or practice.</p>
	      <p>The <b>Unscramble</b> game challenges you to unscramble words from your Learn list.</p>
	      <p>The <b>Collective Nouns</b> section is a curated collection of collective nouns—you know, like a murder of crows or a parliament of owls. The venerable terms of venery are all from either St. Albans or a PDF version of the 1977 edition of James Lipton's <i>An Exaltation of Larks</i>. I had ChatGPT extract the terms from St. Albans and Gemini handle the Exaltation of Larks.</p>

	      <hr/>

	      <h4>Source</h4>

	      <p><b>Luciferous Logolepsy</b> (RIP). Most of the words included here were taken, as far I can tell, from an online resource titled <i>Luciferous Logolepsy</i>, which no longer exists. Years ago&mdash;at least a decade, I think&mdash;I created a database table of words and populated it with roughly 9,000 worthy specimens. I don't recall exactly where I got the words; however, when I compare entries with those at <i>Cafe Arcane</i> (<i>arcane.org/luciferous-logolepsy/</i>), I find several convincing indications of a common source.</p>

	      <p>Since what I believe to have been my original source no longer exists, I feel more free than I otherwise might to use the list without getting someone's permission.</p>
			{/*

		  <p><b>The Phrontistery</b>. Another longtime trove for the logophile is <i>The Phrontistery</i> (<i>phrontistery.info</i>). From this, I took the 412 entries within the group titled <i>Compendium of Lost Words</i>.</p>
		  */}
	  </div>
	</div>
	);
}	

export default About;
