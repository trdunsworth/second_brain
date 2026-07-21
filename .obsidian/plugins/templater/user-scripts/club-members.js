/**
 * Club Members dropdown selection for Toastmasters meeting template
 * Usage: tp.user.selectMember("Role Name")
 * 
 * Edit the MEMBERS array below with your club's member names
 */

const MEMBERS = [
    // Add your club members here alphabetically
    "Basheer Abdul-Malik",
    "Britney Ewers",
    "Caitlin Allard-Ledford",
    "Calvin Harper",
    "Cynthia Lewis, DTM",
    "Devon Waldo",
    "Jaqueline Harrison",
    "Linda Kennedy, DTM",
    "Michael Nickerson",
    "Tiffany Tracey",
    "Tony Dunsworth",
    "Vickie Lewis",
    "Wes Bonafé",
    // Add more members as needed
];

/**
 * Show a dropdown to select a member for a specific role
 * @param {string} role - The role name (e.g., "Toastmaster", "Speaker 1")
 * @returns {string} Selected member name or empty string
 */
async function selectMember(role) {
    const { suggester } = require('suggester');
    
    // Add "None/Unassigned" option at the top
    const choices = ["— None / Unassigned —", ...MEMBERS.sort()];
    
    try {
        const selected = await suggester(
            choices,
            choices,
            true, // single selection
            `Select member for: ${role}`
        );
        
        // Return empty string if "None" selected
        if (selected === "— None / Unassigned —" || !selected) {
            return "";
        }
        return selected;
    } catch (e) {
        // Fallback to prompt if suggester fails
        const input = await tp.system.prompt(`${role} (type name or leave blank):`);
        return input || "";
    }
}

/**
 * Get all club members
 * @returns {string[]} Array of member names
 */
function getMembers() {
    return [...MEMBERS].sort();
}

/**
 * Add a new member to the list (for current session only)
 * @param {string} name - Member name to add
 */
function addMember(name) {
    if (name && !MEMBERS.includes(name)) {
        MEMBERS.push(name);
    }
}

module.exports = { selectMember, getMembers, addMember };