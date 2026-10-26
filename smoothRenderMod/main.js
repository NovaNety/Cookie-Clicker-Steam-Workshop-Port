/*
/	NOTE: Majority of the code below is unchanged from vanilla and it only has small changes
/	
/	Logic fps, this will be the default fps of the game (30, this remains constant)
/	Render fps, this will be the fps that is changed by the user and that is actually seen
/
/	'Game.fpsCoeff' is a scalar value determing how much a value should be altered: its the ratio of (logic fps / render fps). So at a render fps of 30, Game.fpsCoeff = 1 so no change is done to calculations
/	'Game.fpsCoeffInv' is just the inverse of 'Game.fpsCoeff' for ease of use
*/

Game.registerMod("Smooth Render", {
	init:function() {
		if (Steam) Steam.allowSteamAchievs = true;
		
		let Mod = this;

		// Golden cookie animation
		Game.shimmerTypes["golden"].updateFunc = Mod.injectCodes(
			Game.shimmerTypes["golden"].updateFunc, [[
					`if (Game.prefs.fancy) me.l.style.transform='rotate('+(Math.sin(me.id*0.69)*24+Math.sin(Game.T*(0.35+Math.sin(me.id*0.97)*0.15)+me.id/*+Math.sin(Game.T*0.07)*2+2*/)*(3+Math.sin(me.id*0.36)*2))+'deg) scale('+(me.sizeMult*(1+Math.sin(me.id*0.53)*0.2)*curve*(1+(0.06+Math.sin(me.id*0.41)*0.05)*(Math.sin(Game.T*(0.25+Math.sin(me.id*0.73)*0.15)+me.id))))+')';`,
					`if (Game.prefs.fancy) me.l.style.transform='rotate('+(Math.sin(Game.fpsCoeff*me.id*0.69)*24+Math.sin(Game.fpsCoeff*Game.T*(0.35+Math.sin(Game.fpsCoeff*me.id*0.97)*0.15)+me.id/*+Math.sin(Game.fpsCoeff*Game.T*0.07)*2+2*/)*(3+Math.sin(Game.fpsCoeff*me.id*0.36)*2))+'deg) scale('+(me.sizeMult*(1+Math.sin(Game.fpsCoeff*me.id*0.53)*0.2)*curve*(1+(0.06+Math.sin(Game.fpsCoeff*me.id*0.41)*0.05)*(Math.sin(Game.fpsCoeff*Game.T*(0.25+Math.sin(Game.fpsCoeff*me.id*0.73)*0.15)+me.id))))+')';`,
					`replace`
				]]
			);

		// Reindeer cookie animation
		Game.shimmerTypes["reindeer"].updateFunc = Mod.injectCodes(
			Game.shimmerTypes["reindeer"].updateFunc, [[
					`me.l.style.transform='translate('+(me.x+(Game.bounds.right-Game.bounds.left)*(1-me.life/(Game.fps*me.dur)))+'px,'+(me.y-Math.abs(Math.sin(me.life*0.1))*128)+'px) rotate('+(Math.sin(me.life*0.2+0.3)*10)+'deg) scale('+(me.sizeMult*(1+Math.sin(me.id*0.53)*0.1))+')';`,
					`me.l.style.transform='translate('+(me.x+(Game.bounds.right-Game.bounds.left)*(1-me.life/(Game.fps*me.dur)))+'px,'+(me.y-Math.abs(Math.sin(Game.fpsCoeff*me.life*0.1))*128)+'px) rotate('+(Math.sin(Game.fpsCoeff*me.life*0.2+0.3)*10)+'deg) scale('+(me.sizeMult*(1+Math.sin(Game.fpsCoeff*me.id*0.53)*0.1))+')';`,
					`replace`
				]]
			);

		// Particle animation
		Game.particlesUpdate = Mod.injectCodes(
			Game.particlesUpdate, [[
					`if (!me.text) me.yd+=0.2+Math.random()*0.1;`,
					`if (!me.text) me.yd+=Game.fpsCoeff*(0.2+Math.random()*0.1);`,
					`replace`
					], [
					`me.x+=me.xd;`,
					`me.x+=Game.fpsCoeff*me.xd;`,
					`replace`
					], [
					`me.y+=me.yd;`,
					`me.y+=Game.fpsCoeff*me.yd;`,
					`replace`
					]
				]
			);
		
		// Fill a region with the provided image
		CanvasRenderingContext2D.prototype.fillPattern = Mod.injectCodes(
			CanvasRenderingContext2D.prototype.fillPattern, [[
					`var offX=offX||0;`,
					`var offX=(Game.fpsCoeff*offX)||0;`,
					`replace`
					], [
					`var offY=offY||0;`,
					`var offY=(Game.fpsCoeff*offY)||0;`,
					`replace`
					]
				]
			);

		// Heavenly background (ascension), wispy centre (ascension), background particles (left canvas), milk, big cookie shine, shimmering veil, glints, big dragon and cursors
		Game.DrawBackground = Mod.injectCodes(
			Game.DrawBackground, [[
					`var s=1*Game.AscendZoom*(1+Math.cos(Game.T*0.0027)*0.05);`,
					`var s=1*Game.AscendZoom*(1+Math.cos(Game.fpsCoeff*Game.T*0.0027)*0.05);`,
					`replace`
					], [
					`Game.Background.globalAlpha=0.5*(0.5+Math.sin(Game.T*0.02)*0.3);`,
					`Game.Background.globalAlpha=0.5*(0.5+Math.sin(Game.fpsCoeff*Game.T*0.02)*0.3);`,
					`replace`
					], [
					`var s=2*Game.AscendZoom*(1+Math.sin(Game.T*0.002)*0.07);`,
					`var s=2*Game.AscendZoom*(1+Math.sin(Game.fpsCoeff*Game.T*0.002)*0.07);`,
					`replace`
					], [
					`Game.Background.rotate(Game.T*0.001);`,
					`Game.Background.rotate(Game.fpsCoeff*Game.T*0.001);`,
					`replace`
					], [
					`s=(600+150*Math.sin(Game.T*0.007))*Game.AscendZoom;`,
					`s=(600+150*Math.sin(Game.fpsCoeff*Game.T*0.007))*Game.AscendZoom;`,
					`replace`
					], [
					`Game.Background.rotate(-Game.T*0.0017);`,
					`Game.Background.rotate(-Game.fpsCoeff*Game.T*0.0017);`,
					`replace`
					], [
					`s=(600+150*Math.sin(Game.T*0.0037))*Game.AscendZoom;`,
					`s=(600+150*Math.sin(Game.fpsCoeff*Game.T*0.0037))*Game.AscendZoom;`,
					`replace`
					], [
					`var y=(Math.floor(Game.T*2)%512);`,
					`var y=(Math.floor(Game.T*2)%Math.round(Game.fpsCoeffInv*512));`,
					`replace`
					], [
					`var y=(Math.floor(Game.T*2.5)%512);`,
					`var y=(Math.floor(Game.T*2.5)%Math.round(Game.fpsCoeffInv*512));`,
					`replace`
					], [
					`var r=Math.floor((Game.T*0.5)%360);`,
					`var r=Game.fpsCoeff*Math.floor((Game.T*0.5)%Math.round(Game.fpsCoeffInv*360));`,
					`replace`
					], [
					`var s=300*2*(1+Math.sin(Game.T*0.013)*0.1);`,
					`var s=300*2*(1+Math.sin(Game.fpsCoeff*Game.T*0.013)*0.1);`,
					`replace`
					], [
					`var y=Game.cookieOriginY-s/(1.4+0.2*Math.sin(Game.T*0.01));`,
					`var y=Game.cookieOriginY-s/(1.4+0.2*Math.sin(Game.fpsCoeff*Game.T*0.01));`,
					`replace`
					], [
					`if (fancy) w=(Math.sin(Game.T*0.025+(((i+n*12)%25)/25)*Math.PI*2));`,
					`if (fancy) w=(Math.sin(Game.fpsCoeff*Game.T*0.025+(((i+n*12)%25)/25)*Math.PI*2));`,
					`replace`
					], [
					`if (fancy) w+=Math.sin((n+Game.T*0.01)*Math.PI/2)*4;`,
					`if (fancy) w+=Math.sin((n+Game.fpsCoeff*Game.T*0.01)*Math.PI/2)*4;`,
					`replace`
					], [
					`if (i==0 && fancy) rot-=Game.T*0.1;`,
					`if (i==0 && fancy) rot-=Game.fpsCoeff*Game.T*0.1;`,
					`replace`
					], [
					`ctx.rotate(Game.T*0.007);`,
					`ctx.rotate(Game.fpsCoeff*Game.T*0.007);`,
					`replace`
					], [
					`ctx.rotate(-Game.T*0.002);`,
					`ctx.rotate(-Game.fpsCoeff*Game.T*0.002);`,
					`replace`
					], [
					`var x=Math.floor((Game.T*2-(Game.milkH-Game.milkHd)*2000+480*2)%480);`,
					`var x=Math.floor((Game.T*2-(Game.milkH-Game.milkHd)*2000+480*2)%Math.round(Game.fpsCoeffInv*480));`,
					`replace`
					], [
					`var s=300+Math.sin(Game.T*0.037)*20;`,
					`var s=300+Math.sin(Game.fpsCoeff*Game.T*0.037)*20;`,
					`replace`
					], [
					`ctx.rotate(-Game.T*0.01);`,
					`ctx.rotate(-Game.fpsCoeff*Game.T*0.01);`,
					`replace`
					], [
					`var t=Game.T+i*15;`,
					`var t=Game.fpsCoeff*Game.T+i*15;`,
					`replace`
					]
				]
			);

		// Grandma shakes and cookie amount
		Game.Draw = Mod.injectCodes(
			Game.Draw, [[
					`if (Game.drawT%5==0)`,
					`if (Game.drawT % Math.round(Game.fps / 6) == 0)`,
					`replace`
					], [
					`if (Game.prefs.animate && ((Game.prefs.fancy && Game.drawT%1==0) || (!Game.prefs.fancy && Game.drawT%10==0)) && Game.AscendTimer==0 && Game.onMenu=='') Game.DrawBuildings();Timer.track('buildings');`,
					`if (Game.prefs.animate && ((Game.prefs.fancy && Game.drawT%Math.round(Game.fps / 30)==0) || (!Game.prefs.fancy && Game.drawT%Math.round(Game.fps / 3)==0)) && Game.AscendTimer==0 && Game.onMenu=='') Game.DrawBuildings();Timer.track('buildings');`,
					`replace`
					]
				]
			);

		// Big cookie wobble and ascension bar (updated)
		Game.Logic = Mod.injectCodes(
			Game.Logic, [[
					`Game.BigCookieSizeD+=(Game.BigCookieSizeT-Game.BigCookieSize)*0.75;`,
					`if (Date.now() - Game.mods["Smooth Render"].lastWiggleTime >= 33) {Game.BigCookieSizeD += (30 / Game.fps) * (Game.BigCookieSizeT - Game.BigCookieSize) * 0.75; Game.BigCookieSizeD *= 0.75; Game.mods["Smooth Render"].lastWiggleTime = Date.now();}`,
					`replace`
					], [
					`Game.BigCookieSizeD*=0.75;`,
					``,
					`replace`
					], [
					`if (Game.BigCookieState==1) Game.BigCookieSize+=(0.98-Game.BigCookieSize)*0.5;`,
					`if (Date.now() - Game.mods["Smooth Render"].lastWiggleTime >= 33) {`,
					`before`
					], [
					`if (Game.BigCookieState==1) Game.BigCookieSize+=(0.98-Game.BigCookieSize)*0.5;`,
					`if (Game.BigCookieState == 1) Game.BigCookieSize += (30 / Game.fps) * (0.98 - Game.BigCookieSize) * 0.5;`,
					`replace`
					], 
					[
					`else Game.BigCookieSize+=(1-Game.BigCookieSize)*0.5;`,
					`}`,
					`after`
					], [
					`Game.ascendMeter.style.backgroundPosition=(-Game.T*0.5-Game.ascendMeterPercent*100)+'px';`,
					`Game.ascendMeter.style.backgroundPosition=(-Game.fpsCoeff*Game.T*0.5-Game.ascendMeterPercent*100)+'px';`,
					`replace`
					], [
					`if (Game.T%15==0)`,
					`if (Game.T % Math.round(Game.fps / 2) == 0)`,
					`replace`
					], [
					`if (Game.researchT==0 && Game.nextResearch)`,
					`if (Game.researchT <= 0 && Game.nextResearch)`,
					`replace`
					], [
					`Game.seasonT--;`,
					`Game.seasonT -= Game.fpsCoeff;`,
					`replace`
					], [
					`Game.researchT--;`,
					`Game.researchT -= Game.fpsCoeff;`,
					`replace`
					], [
					`Game.updateBuffs();`,
					``,
					`replace`
					]
				]
			);

		// Wrinkler jiggle
		Game.UpdateWrinklers = Mod.injectCodes(
			Game.UpdateWrinklers, [[
					`if (Game.prefs.fancy) d+=Math.cos(Game.T*0.05+parseInt(me.id))*4;`,
					`if (Game.prefs.fancy) d+=Math.cos(Game.fpsCoeff*Game.T*0.05+parseInt(me.id))*4;`,
					`replace`
					], [
					`if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.05+parseInt(me.id))*4;`,
					`if (Game.prefs.fancy) me.r+=Math.sin(Game.fpsCoeff*Game.T*0.05+parseInt(me.id))*4;`,
					`replace`
					], [
					`if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.09+parseInt(me.id))*4;`,
					`if (Game.prefs.fancy) me.r+=Math.sin(Game.fpsCoeff*Game.T*0.09+parseInt(me.id))*4;`,
					`replace`
					], [
					`me.r+=(Math.sin(Game.T*1)*me.hurt)*18;//Math.random()*2-1;`,
					`me.r+=(Math.sin(Game.fpsCoeff*Game.T*1)*me.hurt)*18;//Math.random()*2-1;`,
					`replace`
					], [
					`var onWrinkler=0;`,
					`function inRect(t, h, a) {var n = t + Math.sin(-a.r) * -(a.h / 2 - a.o), t = h + Math.cos(-a.r) * -(a.h / 2 - a.o), h = Math.sqrt(n * n + t * t), t = Math.atan2(t, n) - a.r, n = Math.cos(t) * h, h = Math.sin(t) * h; return n > -.5 * a.w && n < .5 * a.w && h > -.5 * a.h && h < .5 * a.h};`,
					`after`
					], [
					`if (me.hp<Game.wrinklerHP) me.hp+=0.04;`,
					`if (me.hp<Game.wrinklerHP) me.hp+=Game.fpsCoeff*0.04;`,
					`replace`
					], [
					`if (me.hp<Game.wrinklerHP*3) me.hp+=0.04;`,
					`if (me.hp<Game.wrinklerHP*3) me.hp+=Game.fpsCoeff*0.04;`,
					`replace`
					], [
					`if (Math.random()<chance)`,
					`if (Math.random() < (Game.fpsCoeff * chance))`,
					`replace`
					], [
					`if (Math.random()<0.01 && !Game.prefs.notScary) me.hurt=Math.max(me.hurt,Math.random());`,
					`if (Math.random()<Game.fpsCoeff*0.01 && !Game.prefs.notScary) me.hurt=Math.max(me.hurt,Math.random());`,
					`replace`
					]
				]
			);

		// Wrinkler pulse, not scary eyes and eye of the wrinkler upgrade
		Game.DrawWrinklers = Mod.injectCodes(
			Game.DrawWrinklers, [[
					`var sw=100+2*Math.sin(Game.T*0.2+i*3);`,
					`var sw=100+2*Math.sin(Game.fpsCoeff*Game.T*0.2+i*3);`,
					`replace`
					], [
					`var sh=200+5*Math.sin(Game.T*0.2-2+i*3);`,
					`var sh=200+5*Math.sin(Game.fpsCoeff*Game.T*0.2-2+i*3);`,
					`replace`					
					], [
					`if (!Game.WINKLERS && Game.prefs.notScary) ctx.drawImage(Pic(Math.sin(Game.T*0.003+i*11+137+Math.sin(Game.T*0.017+i*13))>0.9997?'wrinklerBlink.png':'wrinklerGooglies.png'),-sw/2,-10+1*Math.sin(Game.T*0.2+i*3+1.2),sw,sh);`,
					`if (!Game.WINKLERS && Game.prefs.notScary) ctx.drawImage(Pic(Math.sin(Game.fpsCoeff*Game.T*0.003+i*11+137+Math.sin(Game.fpsCoeff*Game.T*0.017+i*13))>0.9997?'wrinklerBlink.png':'wrinklerGooglies.png'),-sw/2,-10+1*Math.sin(Game.fpsCoeff*Game.T*0.2+i*3+1.2),sw,sh);`,
					`replace`					
					], [
					`ctx.arc(xC,yC,4+(Game.prefs.fancy?2*Math.pow(Math.sin(-Game.T*0.2+i*0.3),4):0),0,2*Math.PI,false);`,
					`ctx.arc(xC,yC,4+(Game.prefs.fancy?2*Math.pow(Math.sin(-Game.fpsCoeff*Game.T*0.2+i*0.3),4):0),0,2*Math.PI,false);`,
					`replace`					
					], [
					`var s=54+2*Math.sin(Game.T*0.4);`,
					`var s=54+2*Math.sin(Game.fpsCoeff*Game.T*0.4);`,
					`replace`
					], [
					`var width=Math.ceil(Math.max(ctx.measureText(text).width,ctx.measureText(Beautify(selected.sucked)).width));`,
					`if (width > Game.mods["Smooth Render"].wrinklerEyeUpgradeMaxWidth) {Game.mods["Smooth Render"].wrinklerEyeUpgradeMaxWidth = width;};width = Game.mods["Smooth Render"].wrinklerEyeUpgradeMaxWidth;`,
					`after`
					]
				]
			);

		Game.UpdateGrandmapocalypse = Mod.injectCodes(
			Game.UpdateGrandmapocalypse, [[
					`Game.pledgeT--;`,
					`Game.pledgeT -= Game.fpsCoeff;`,
					`replace`
					], [
					`if (Game.pledgeT==0)`,
					`if (Game.pledgeT <= 0)`,
					`replace`
					]
				]
			);

		// Little icon animation to the bottom left of the screen (next to the version number)
		Game.DrawSpecial = Mod.injectCodes(
			Game.DrawSpecial, [[
					`var r=Math.floor((Game.T*0.5)%360);`,
					`var r=Math.floor((Game.fpsCoeff*Game.T*0.5)%360);`,
					`replace`
					], [
					`if (Game.prefs.fancy) Game.LeftBackground.drawImage(Pic(pic),96*frame,0,96,96,(x+(selected?0:Math.sin(Game.T*0.2+tabI)*3)-24*s),(y-(selected?6:Math.abs(Math.cos(Game.T*0.2+tabI))*6)-24*s),48*s,48*s);`,
					`if (Game.prefs.fancy) Game.LeftBackground.drawImage(Pic(pic),96*frame,0,96,96,(x+(selected?0:Math.sin(Game.fpsCoeff*Game.T*0.2+tabI)*3)-24*s),(y-(selected?6:Math.abs(Math.cos(Game.fpsCoeff*Game.T*0.2+tabI))*6)-24*s),48*s,48*s);`,
					`replace`
					]
				]
			);

		// Adjusts the way buff times are calculated - The old caluclation assumed the FPS remains constant from the start to the end of the buff
		Game.gainBuff = Mod.injectCodes(
			Game.gainBuff, [[
					`var obj=type.func(time,arg1,arg2,arg3);`,
					`obj.time = time;`,
					`after`
					]
				]
			);

		Game.LoadSave = Mod.injectCodes(
			Game.LoadSave, [[
					`Game.gainBuff(type.name,parseFloat(mestr[1])/Game.fps,parseFloat(mestr[3]||0),parseFloat(mestr[4]||0),parseFloat(mestr[5]||0)).time=parseFloat(mestr[2]);`,
					`Game.gainBuff(type.name,parseFloat(mestr[1]),parseFloat(mestr[3]||0),parseFloat(mestr[4]||0),parseFloat(mestr[5]||0)).time=parseFloat(mestr[2]);`,
					`replace`
					]
				]
			);

		Game.updateBuffs = Mod.injectCodes(
			Game.updateBuffs, [[
					`buff.time--;`,
					`buff.time -= 0.05;`,
					`replace`
					]
				]
			);

		Mod.updateBuffsInterval = setInterval(() => {
			if (Game.ready) {
				Game.updateBuffs();
			}
		}, 50);

		// Fixes the graden minigame times; updates within an interval as the minigame does not initialize the same time the mod does so some objects are undefined
		Mod.farmIntervalId = setInterval(() => {
			if (Game.isMinigameReady(Game.Objects["Farm"]) || 0) {
				Game.Objects["Farm"].minigame.getPlantDesc = Mod.injectCodes(
					Game.Objects["Farm"].minigame.getPlantDesc, [[
							`var children='';`,
							`var M=Game.Objects["Farm"].minigame;`,
							`before`
							], [
							`Game.sayTime(((100/(me.ageTick+me.ageTickR/2))*dragonBoost*M.stepT)*30,-1)`,
							`Game.sayTime(((100/(me.ageTick+me.ageTickR/2))*dragonBoost*M.stepT)*Game.fps,-1)`,
							`replace`
							], [
							`Game.sayTime(((100/((me.ageTick+me.ageTickR/2)))*(me.mature/100)*dragonBoost*M.stepT)*30,-1)`,
							`Game.sayTime(((100/((me.ageTick+me.ageTickR/2)))*(me.mature/100)*dragonBoost*M.stepT)*Game.fps,-1)`,
							`replace`
							]
						]
					);

				Game.Objects["Farm"].minigame.soilTooltip = Mod.injectCodes(
					Game.Objects["Farm"].minigame.soilTooltip, [[
							`var me=M.soilsById[id];`,
							`var M=Game.Objects["Farm"].minigame;`,
							`before`
							], [
							`Game.sayTime((M.nextSoil-Date.now())/1000*30+30,-1)`,
							`Game.sayTime((M.nextSoil-Date.now())/1000*Game.fps+30,-1)`,
							`replace`
							]
						]
					);

				Game.Objects["Farm"].minigame.tileTooltip = Mod.injectCodes(
					Game.Objects["Farm"].minigame.tileTooltip, [[
							`if (Game.keys[16]) return '';`,
							`var M=Game.Objects["Farm"].minigame;`,
							`before`
							], [
							`Game.sayTime(((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((me.mature-tile[1])/100)*dragonBoost*M.stepT)*30,-1)`,
							`Game.sayTime(((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((me.mature-tile[1])/100)*dragonBoost*M.stepT)*Game.fps,-1)`,
							`replace`
							], [
							`Game.sayTime(((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((100-tile[1])/100)*dragonBoost*M.stepT)*30,-1)`,
							`Game.sayTime(((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((100-tile[1])/100)*dragonBoost*M.stepT)*Game.fps,-1)`,
							`replace`
							]
						]
					);

				Game.Objects["Farm"].minigame.draw = Mod.injectCodes(
					Game.Objects["Farm"].minigame.draw, [[
							`if (M.cursorL)`,
							`var M=Game.Objects["Farm"].minigame;`,
							`before`
							], [
							`else l('gardenNextTick').innerHTML=loc("Next tick in %1.",Game.sayTime((M.nextStep-Date.now())/1000*30+30,-1));`,
							`else l('gardenNextTick').innerHTML=loc("Next tick in %1.",Game.sayTime((M.nextStep-Date.now())/1000*Game.fps+30,-1));`,
							`replace`
							]
						]
					);

				clearInterval(Mod.farmIntervalId);
			}
		}, 100);

		// Fixes the bar filling animation and refill rate
		Mod.grimoireIntervalId = setInterval(() => {
			if (Game.isMinigameReady(Game.Objects["Wizard tower"]) || 0) {
				Game.Objects["Wizard tower"].minigame.draw = Mod.injectCodes(
					Game.Objects["Wizard tower"].minigame.draw, [[
							`if (Game.drawT%5==0)`,
							`var M=Game.Objects["Wizard tower"].minigame;`,
							`before`
							], [
							`M.magicBarFullL.style.backgroundPosition=(-Game.T*0.5)+'px';`,
							`M.magicBarFullL.style.backgroundPosition=(-Game.T*0.5*Game.fpsCoeff)+'px';`,
							`replace`
							]
						]
					);

				Game.Objects["Wizard tower"].minigame.logic = Mod.injectCodes(
					Game.Objects["Wizard tower"].minigame.logic, [[
							`if (Game.T%5==0) {M.computeMagicM();}`,
							`var M=Game.Objects["Wizard tower"].minigame;`,
							`before`
							], [
							`M.magicPS=Math.max(0.002,Math.pow(M.magic/Math.max(M.magicM,100),0.5))*0.002;`,
							`M.magicPS=Math.max(0.002,Math.pow(M.magic/Math.max(M.magicM,100),0.5))*0.002*Game.fpsCoeff;`,
							`replace`
							]
						]
					);

				clearInterval(Mod.grimoireIntervalId);
			}
		}, 100);

		// Updates the fps of 'Game' and other necessary variables associated with the fps
		Game.updateFps = function(fps) {
			fps = parseInt(fps) === NaN ? 30 : parseInt(fps);
			Game.fps = fps;
			Game.fpsCoeff = 30 / fps;
			Game.fpsCoeffInv = fps / 30;
			Game.ReincarnateDuration = fps;
			Game.AscendDuration = fps * 5;
		}

		// Initialise all variables to a default FPS of 30
		Game.updateFps(30);

		// Add fps div to the top left
		l("ascend").after(Mod.elementFromHtml("<div id='renderFps' style='position: absolute; left: 0px; top: 0px; z-index: 10; font-size: 10px; background: #000; padding: 1px; opacity: 0.5'></div>"));

		// Bind 'showFps' function to the 'Game.Logic' function
		Mod.showFps = Game.Logic.bind({});
		Mod.lastFrameTime = Date.now();
		Mod.lastWiggleTime = Date.now();
		Mod.wrinklerEyeUpgradeMaxWidth = 0;
		Mod.frameCount = 0;
		Mod.lastFps = 0;
		Mod.currentFps = 0;

		// Displays the current render fps to the top left, if enabled in preferences
		Game.Logic = () => {
			let Mod = Game.mods["Smooth Render"];

			Mod.showFps();

			// 'showFps' function
			if (Game.prefs.displayFps) {
				if (Date.now() - Mod.lastFrameTime > 500) {
					Mod.lastFps = Mod.currentFps;
					Mod.currentFps = Mod.frameCount << 1;
					Mod.frameCount = 0;
					Mod.lastFrameTime = Date.now();
					l("renderFps").style.display = "";
					l("renderFps").innerText = ((Mod.currentFps + Mod.lastFps) >> 1) + " fps";
				}

				Mod.frameCount++;
			}
			else {
				l("renderFps").style.display = "none";
			}
		}

		// Updates the preferences menu and adds the fps slider next to the volume sliders. Also adds a button 'Fps label' which toggles the visibility of the fps display to the top left
		// You can also click the FPS slider to set your own custom FPS
		Mod.updateMenu = Game.UpdateMenu.bind({});

		Game.UpdateMenu = () => {
			let Mod = Game.mods["Smooth Render"];
			
			Mod.updateMenu();
			
			if (Game.onMenu == "prefs") {
				var bgMusicButton = l("bgMusicButton");
				
				l("volumeSliderRightText").parentNode.before(Mod.elementFromHtml(Mod.writeRangedSlider("fpsSlider", loc("Fps"), "[$]", 30, 150, function() {return Game.fps;}, "l('fpsSliderRightText').innerHTML = l('fpsSlider').value; Game.updateFps(l('fpsSlider').value)")));
				
				var fpsSlider = l("fpsSlider");

				fpsSlider.parentNode.style = "cursor: pointer;";

				fpsSlider.parentNode.addEventListener("mouseenter", () => {
					fpsSlider.parentNode.style["border-color"] = "#fff";
					fpsSlider.parentNode.style["color"] = "#fff";
					fpsSlider.parentNode.style["text-shadow"] = "none";
				});

				fpsSlider.parentNode.addEventListener("mouseleave", () => {
					fpsSlider.parentNode.style["border-color"] = null;
					fpsSlider.parentNode.style["color"] = null;
					fpsSlider.parentNode.style["text-shadow"] = null;
				});

				fpsSlider.parentNode.children[2].addEventListener("mouseenter", () => {
					fpsSlider.parentNode.style["border-color"] = null;
					fpsSlider.parentNode.style["color"] = null;
					fpsSlider.parentNode.style["text-shadow"] = null;
				});

				fpsSlider.parentNode.children[2].addEventListener("mouseleave", () => {
					fpsSlider.parentNode.style["border-color"] = "#fff";
					fpsSlider.parentNode.style["color"] = "#fff";
					fpsSlider.parentNode.style["text-shadow"] = "none";
				});

				fpsSlider.parentNode.onclick = () => {
					Game.Prompt(`
						<h3>Smooth FPS</h3>
						<div class="block">
							Enter your own custom FPS
							<div class="line"></div>
							The FPS is not designed to be set below 30!
							<div class="line"></div>
							<input id="customFpsInput" type="number" min="1" max="10000" style="width: 100px;"></input>
							<div class="line"></div>
							<a class="option" onclick="if (l('customFpsInput').value === undefined || l('customFpsInput').value === '') {Game.updateFps(30)} else {Game.updateFps(l('customFpsInput').value)}; PlaySound('snd/tickOff.mp3'); Game.ClosePrompt();">Set</a>
						</div>
					`, "", "", "");
				}

				fpsSlider.parentNode.children[2].onclick = (e) => {
					e.stopPropagation();
				};

				bgMusicButton.before(Mod.elementFromHtml(Game.WritePrefButton("displayFps", "displayFpsButton", "Fps label" + ON, "Fps label" + OFF, "", "")));
				bgMusicButton.before(Mod.elementFromHtml("<label>(" + loc("toggles the display of the fps label to the top left") + ")</label>"));
				bgMusicButton.before(Mod.elementFromHtml("<br>"));
			}
		}
	},

	// Same function as 'Game.WriteSlider()' execpt with a range
	writeRangedSlider:function(slider, leftText, rightText, minRange, maxRange, startValueFunction, callback) {
		if (!callback) callback='';
		return '<div class="sliderBox"><div style="float:left;" class="smallFancyButton">'+leftText+'</div><div style="float:right;" class="smallFancyButton" id="'+slider+'RightText">'+rightText.replace('[$]',startValueFunction())+'</div><input class="slider" style="clear:both;" type="range" min="'+minRange+'" max="'+maxRange+'" step="1" value="'+startValueFunction()+'" onchange="'+callback+'" oninput="'+callback+'" onmouseup="PlaySound(\'snd/tick.mp3\');" id="'+slider+'"/></div>';
	},

	// Turns HTML text into a HTML element
	elementFromHtml:function(html) {
		var template = document.createElement("template");
		template.innerHTML = html.trim();
		return template.content.firstChild;
	},

	// Injects code before or after a unique code snippet or replaces the code snippet
	injectCodes:function(r, t, o = {}) {
		function e(e, r) {
			const t = null === r[0];
			let o = new RegExp("");
			null !== r[0] && (o = "string" == typeof r[0] ? new RegExp(r[0].replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "g") : r[0], o.test(e) || console.warn("Nothing to inject."));
			const n = /(\)[^{]*{)/,
				c = /(}?)$/;
			switch (r[2]) {
				case "before":
					e = t ? e.replace(n, `$1${r[1]}`) : e.replace(o, `${r[1]}${r[0]}`);
					break;
				case "replace":
					e = t ? r[1] : e.replace(o, r[1]);
					break;
				case "after":
					e = t ? e.replace(c, `${r[1]}$1`) : e.replace(o, `${r[0]}${r[1]}`);
					break;
				default:
					throw new Error('where Parameter must be "before", "replace" or "after"')
			}
			return e
		}

		let n = r.toString();
		for (const r of t) n = e(n, r);
		const c = Function(...Object.keys(o), `return (${n})`)(...Object.values(o));
		return c.prototype = r.prototype, c
	},

	save:function() {
		var data = [Game.fps === undefined ? 30 : Game.fps, Game.prefs.displayFps === undefined ? 0 : Game.prefs.displayFps];
		return JSON.stringify(data);
	},

	load:function(str) {
		var data = JSON.parse(str === "" ? "[30,0]" : str);
		Game.updateFps(data[0] === undefined ? 30 : data[0]);
		Game.prefs.displayFps = data[1] === undefined ? 0 : data[1];
	}
});