const optimizeBgCalc = {
    name: 'optimizeBgCalc',
    origins: {},
    prevTime: null,
    config: {
        debug: false,
        enableModHook: false
    },
    debug: {
        maxAvgCount: 60,
        avgLoopInterval: []
    },
    init: function() {
        // fix Game.Loop
        optimizeBgCalc.origins.loop = Game.Loop
        Game.Loop = function() {
            // If Game.visible is true, use default processing
            if (Game.visible) {
                optimizeBgCalc.prevTime = null
                return optimizeBgCalc.origins.loop()
            }

            let timeDiff = Date.now() - optimizeBgCalc.prevTime
            let loop = Math.round(timeDiff / (1000 / Game.fps))
            if (optimizeBgCalc.prevTime && loop) {
                Game.catchupLogic = 0
                optimizeBgCalc.baseLogic(loop)
                Game.catchupLogic = 1

                Game.time = Date.now()
                Game.catchupLogic = 0

                Game.loopT++

                optimizeBgCalc.debug.avgLoopInterval[Game.loopT % optimizeBgCalc.debug.maxAvgCount] = timeDiff
            }

            optimizeBgCalc.prevTime = Date.now()
            setTimeout(Game.Loop, 500)
        }

        // inject menu
        if (typeof Game.customMenu !== 'undefined') {
            Game.customMenu.push(() => {
                if (Game.onMenu == 'prefs') {
                    optimizeBgCalc.injectMenu()
                }
            })
        } else {
            let origin = Game.UpdateMenu.toString().split('\n')
            origin.splice(origin.length - 1, 0, `
                if(Game.onMenu == 'prefs'){
                    optimizeBgCalc.injectMenu()
                }
            `)

            Function(`Game.UpdateMenu = ${origin.join('\n')}`)()
        }
    },
    register: function() {
        Game.registerMod(this.name, this)
    },
    save: function () {
        return JSON.stringify(this.config)
    },
    load: function (data) {
        this.config = JSON.parse(data)
    },
    baseLogic: function(loop) {
        Game.Logic()
        if (loop <= 1) return

        for (let i = 0; i < loop - 1; i++) {
            optimizeBgCalc.optimizedLogic()
        }
    },
    optimizedLogic: function() {
        if (!Game.OnAscend && Game.AscendTimer == 0) {
            for (var i in Game.Objects) {
                if (Game.Objects[i].eachFrame) Game.Objects[i].eachFrame()
            }

            Game.UpdateGrandmapocalypse()

            if (Game.researchT > 0) {
                Game.researchT--
            }

            if (Game.seasonT > 0) {
                Game.seasonT--
            }

            if (Game.recalculateGains) Game.CalculateGains()
            Game.Earn(Game.cookiesPs / Game.fps)

            // minigames
            for (var i in Game.Objects) {
                var me = Game.Objects[i]
                if (Game.isMinigameReady(me) && me.minigame.logic && Game.ascensionMode != 1) me.minigame.logic()
            }

            // wrinklers
            if (Game.cpsSucked > 0) {
                Game.Dissolve((Game.cookiesPs / Game.fps) * Game.cpsSucked)
                Game.cookiesSucked += ((Game.cookiesPs / Game.fps) * Game.cpsSucked)
            }

            for (var i in Game.Objects) {
                var me = Game.Objects[i]
                me.totalCookies += (me.storedTotalCps * Game.globalCpsMult) / Game.fps
            }

            // recalculate CpS every 10 seconds (for dynamic boosts such as Century egg)
            if (Game.T % (Game.fps * 10) == 0) Game.recalculateGains = 1

            // 1 chance in 1,000,000 every second achievement
            if (Game.T % (Game.fps) == 0 && Math.random() < 1 / 1000000) Game.Win('Just plain lucky')

            Game.cookiesd += (Game.cookies - Game.cookiesd) * 0.3

            Game.updateShimmers()
            Game.updateBuffs()
        }

        if (Game.T % (Game.fps * 10) == 0) {
            var title = 'Cookie Clicker'
            if (Game.season == 'fools') title = 'Cookie Baker'
            document.title = (Game.OnAscend ? (EN ? 'Ascending! ' : (loc("Ascending") + ' | ')) : '') + loc("%1 cookie", LBeautify(Game.cookies)) + ' - ' + title
        }

        if (optimizeBgCalc.config.enableModHook) Game.runModHook('logic')

        if ((Game.toSave || (Game.T % (Game.fps * 60) == 0 && Game.T > Game.fps * 10 && Game.prefs.autosave)) && !Game.OnAscend) {
            //check if we can save : no minigames are loading
            var canSave = true
            for (var i in Game.Objects) {
                var me = Game.Objects[i]
                if (me.minigameLoading) {
                    canSave = false
                    break
                }
            }
            if (canSave) Game.WriteSave()
        }

        if (App && App.logic) App.logic(Game.T)

        //every hour: get server data (ie. update notification, patreon, steam etc)
        if (Game.T % (Game.fps * 60 * 60) == 0 && Game.T > Game.fps * 10) {
            Game.CheckUpdates()
            Game.GrabData()
        }

        Game.T++
    },
    injectMenu: function () {
        const button = l('notScaryButton')
        const modHookButton = document.createElement('div')
        modHookButton.innerHTML = `<a class="smallFancyButton prefButton option ${this.config.enableModHook ? 'on' : 'off'}" id="modHookButton" ${Game.clickStr}="optimizeBgCalc.modHookButton()">${loc('bco_modHook')} ${this.config.enableModHook ? loc('ON') : loc('OFF')}</a><label>(${loc('bco_modHookDescription')})</label><br>`
        button.parentNode.insertBefore(modHookButton, button.nextElementSibling)

        const debugButton = document.createElement('div')
        debugButton.innerHTML = `<a class="smallFancyButton option" id="bcoDebugButton" ${Game.clickStr}="optimizeBgCalc.showDebugDialog()">${loc('bco_debugButton')}</a><label>(${loc('bco_debugButtonDescription')})</label><br>`
        button.parentNode.insertBefore(debugButton, modHookButton.nextElementSibling)
    },
    modHookButton: function () {
        const button = l('modHookButton')
        this.config.enableModHook = !this.config.enableModHook
        button.innerHTML = `${loc('bco_modHook')} ${this.config.enableModHook ? loc('ON') : loc('OFF')}`

        if (this.config.enableModHook) {
            button.classList.remove('off')
            button.classList.add('on')
        } else {
            button.classList.remove('on')
            button.classList.add('off')
        }

        PlaySound('snd/tick.mp3')
    },
    showDebugDialog: function() {
        const avgLoopInterval = optimizeBgCalc.debug.avgLoopInterval.filter(x => x)
        const avgLoopCount = avgLoopInterval.map(x => x / (1000 / Game.fps))
        const rawLoopCount = avgLoopCount.reduce((a, c) => a + c, 0)
        const rawTimeDiff = avgLoopInterval.reduce((a, c) => a + c, 0)
        
        let elements = []
        elements.push(`<div style="margin: 6px 0;">Loop interval (avg): ${avgLoopInterval.length ? (rawTimeDiff / avgLoopInterval.length).toFixed(2) + 'ms' : 'No data'}</div>`)
        elements.push(`<div style="margin: 6px 0;">Loop count (avg): ${avgLoopCount.length ? (rawLoopCount / avgLoopCount.length).toFixed(2) : 'No data'}</div>`)
        elements.push(`<div style="margin: 6px 0;">VirtualFPS: ${(rawLoopCount * (1000 / rawTimeDiff)).toFixed(2) } / TargetFPS: ${Game.fps}</div>`)
        elements.push(`<div>Samples: ${avgLoopInterval.length}</div>`)
        elements.push(`<div class="line"></div>`)
        elements.push(`<div>Override samples limit:</div><input id="overrideSampleCount" type="number" value="${optimizeBgCalc.debug.maxAvgCount}" min="1" onchange="optimizeBgCalc.debug.maxAvgCount = parseInt(l('overrideSampleCount').value)">`)

        Game.Prompt(`<id BcoDebugDialog><h3>${loc('bco_debug')}</h3>${elements.join('')}`, ['OK', ['Copy to clipboard', 'optimizeBgCalc.copyDebugInfo()']]);

        PlaySound('snd/tick.mp3')
    },
    copyDebugInfo: function() {
        const avgLoopInterval = optimizeBgCalc.debug.avgLoopInterval.filter(x => x)

        let texts = []
        texts.push(`--- BCO Debug Info ---`)
        texts.push(`LI: ${avgLoopInterval.join(', ')}`)
        texts.push(`Samples: ${avgLoopInterval.length}`)
        texts.push(`----------------------`)

        navigator.clipboard.writeText(texts.join('\n'))
    },
}

optimizeBgCalc.register()
