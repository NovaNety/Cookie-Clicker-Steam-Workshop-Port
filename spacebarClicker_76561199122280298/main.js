Game.registerMod("spacebar clicker",
{
	init:function()
	{
		let MOD = this;
		MOD.spaceDown = false;

		document.addEventListener("keydown", (event) =>
		{
			if (event.code === "Space" && !MOD.spaceDown)
			{
				MOD.spaceDown = true;
				Game.ClickCookie();
			}
		});

		document.addEventListener("keyup", (event) =>
		{
			if (event.code === "Space")
				MOD.spaceDown = false;
		});
	}
});
