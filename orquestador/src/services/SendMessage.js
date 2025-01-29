
const SendMessage = async (puerto, number) => {
    await fetch(`http://localhost:${puerto}/v1/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            number,
        }),
    });
}
module.exports = SendMessage;