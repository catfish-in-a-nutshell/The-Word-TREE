let modInfo = {
	name: "The Word: TREE",
	id: "import_RWFzVEVSZWdn",
	author: "catfish",
	pointsName: "<span class='c1'>T</span><span class='c2'>R</span><span class='c3'>E</span><span class='c4'>E</span> points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
	allowSmall: true
}

// Set your version in num and name
let VERSION = {
	num: "1.0",
	name: "The intro to TREE",
}

let changelog = `
	<h1>Changelog:</h1><br>
	<h3>v1.0: Almost a tree but chaotic (5)</h3><br>
		- Added the first layer.<br>
		- Endgame: 1e86 TREE points and 4 ??????s.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["submitText", "etherParticle", "meteorRes", "trackLastClickId"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return !player.s.paused && hasUpgrade("p", 11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade("p", 12)) gain = gain.mul(upgradeEffect("p", 12))

	if (tmp.p.eternalUnlocked) {
		gain = gain.div(tmp.p.eternitiesEffect)
	}

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function() {
		if (player.s.paused) return "Game paused (w to resume)"
	}
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("1e86"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}