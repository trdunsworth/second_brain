async function selectMember(role) {
    return await tp.system.prompt(`${role} (type name):`);
}
module.exports = { selectMember };