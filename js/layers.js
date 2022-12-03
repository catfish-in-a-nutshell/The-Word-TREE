function d(n) {
    return new Decimal(n)
}

function after_exp_gain(res, rate, diff) {
    let log_res = res.log(Math.E)
    log_res = log_res.add(d(rate).log(Math.E).mul(diff))
    return d(Math.E).pow(log_res)
}

function res_styled_text(res, color, shadow_color) {
    shadow_color = shadow_color ? shadow_color : color
    return `<h2 style="color: ${color}; text-shadow: 0px 0px 10px ${shadow_color}">${res}</h2>`
}

function wrap(word, need_feedback) {
    let should_wrap = hasUpgrade("p", 15)
    if (word.indexOf("tree") >= 0 && hasUpgrade("p", 11))
        should_wrap = true

    let ret_word = ""
    if (should_wrap) {
        let t = 1, r = 1, e = 2;
        for (let i in word) {
            i = word[i]
            if (i == 't' && t == 1) {
                ret_word += "<span class='c1'>T</span>"
                t--; continue
            }
            if (i == 'r' && r == 1) {
                ret_word += "<span class='c2'>R</span>"
                r--; continue
            }
            if (i == 'e' && e == 2) {
                ret_word += "<span class='c3'>E</span>"
                e--; continue
            }
            if (i == 'e' && e == 1) {
                ret_word += "<span class='c4'>E</span>"
                e--; continue
            }
            ret_word += i
        }
        ret_word = (t == 0 && r == 0 && e == 0) ? ret_word : word
        if (need_feedback)
            return [ret_word, t == 0 && r == 0 && e == 0]
        else 
            return ret_word
    }
    return word
}

function peter_upgrade_style(width, height) {
    return { 
        width: width, 
        "border-radius": "0px", 
        height: height ? height : "70px", 
        "min-height": "0px",
        "word-break": "break-all"
    }
}

let enhance_upgs_style = peter_upgrade_style("48px", "330px")

function meter_style_helper(ind) {
    let is_running = player.p.cur_converting === ind
    return {
        "background": is_running ? layers.p.color : "transparent",
        "width": "100px",
        "height": "100px",
        "color": is_running ? "black" : "#95a5a6",
        "border": `1px ${is_running ? "#636e72" : "#95a5a6"} solid`,
        "border-radius": "0px",
        "box-shadow": `2px 2px 0px ${is_running ? "#636e72" : "#95a5a6"}`,
        "font-size": "14px",
    }
}

function meter_res_display_helper(ind, dispn) {
    if (player.p.cur_converting !== ind) {
        return `Slowly convert<br> 1% of<br> ${wrap("meter")} <br> to<br> ${dispn}`
    } else {
        return `Converting...`
    }
}

let meter_res_display_style = {
    "background": "transparent",
    "width": "100px",
    "color": "#95a5a6",
    "height": "100px",
    "border": `none`,
    "font-size": "14px",
}

let meter_res = ["cm", "km", "nm", "pm", "metre"]
let meter_res_ratio = [d(100), d(0.001), d("1e9"), d(0.1), d(1)]
let meter_qol_desc = [
    () => "keep reset things",
    () => `passively gain 20% ${wrap("prestige")} points per second`,
    () => `keep more upgrades on ${wrap("reset")}`,
    () => `keep all upgrades on ${wrap("reset")}`,
    () => `passively gain 10% ${wrap("meter")} per second`
]

let ether_buyable_style = {
    "border-radius": "0",
    "text-shadow": "0 0 10px black"
}

function meteorRes(res) {
    if (tmp.p.meteorUnlocked) {
        res = res.div(tmp.p.meteorEffect)
    }
    return res
}

addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        text_input: "INPUT HERE",
        total_texts: [],
        typed_trees: d(0),
        peters: d(1),
        jsscripts: d(0),
        improve_upgs_bought: 0,
        enhance_upgs_bought: 0,
        time_cnt: 0,
        meter_unlocked: false,
        best_meters: d(0),
        best_ethers: d(0),
        meters: d(0),
        cur_converting: -1,
        cm: d(0),
        km: d(0),
        nm: d(0),
        pm: d(0),
        metre: d(0),

        last_ether_particle: 0,
        ethers: d(0),
        eternities: d(1),

        eater: d(0),
        last_click_ids: []
    }},
    pointsName() {
        return hasUpgrade("p", 14) ? `${wrap("tree")} points` : "points"
    },

    totalTextParse() {
        let txt = "", cnt = 0
        for (let i in player.p.total_texts) {
            let res = wrap(player.p.total_texts[i], true)
            txt += res[0] + " "
            if (res[1]) cnt++
        }
        return [txt.length > 0 ? txt : "??", cnt]
    },

    improve_upg_costs: [d(3000), d(10000), d(30000), d(90000), d(90000)], 
    
    enhance_upg_costs: [d("2e5"), d("4e5"), d("8e5"), d("1.6e6"), d("3.2e6"), d("6.4e6"), d("1.28e7"), d("2.56e7"), d("2.56e7")],

    showTabButton: () => player.p.best.gte(50),

    upgrades: {
        11: {
            title: () => `Start this ${wrap("tree")} game`,
            description: () => `For no reason, you can see ${wrap("tree")}s.`,
            cost: d(1),
        },
        12: {
            title: () => `Useful`,
            description: () => `${wrap("tree")}s you've found in this game boosts ${tmp.p.pointsName}.`,
            effect() {
                let cnt = 0
                if (tmp.p.upgrades[11].unlocked) cnt += 2
                if (tmp.p.upgrades[12].unlocked) cnt += 1
                if (hasUpgrade("p", 13)) cnt += 6
                if (hasUpgrade("p", 14)) cnt += 4
                if (hasUpgrade("p", 15)) cnt += 13
                if (hasUpgrade("p", 21)) cnt += 1
                if (hasUpgrade("p", 22)) cnt += 5

                if (hasUpgrade("p", 21)) {
                    cnt += tmp.p.totalTextParse[1]
                }


                if (tmp.p.showTabButton) {
                    cnt += 7
                }

                let cnt_d = d(cnt)
                cnt_d = cnt_d.add(player.p.typed_trees)
                return cnt_d
            },
            effectDisplay() {
                return `x${format(upgradeEffect(this.layer, this.id))}`
            },
            cost: d(1),
            unlocked: () => hasUpgrade("p", 11)
        },
        13: {
            title: () => hasUpgrade("p", 13) ? `More ${wrap("tree")}s` : "???",
            description: () => hasUpgrade("p", 13) ? `Everyone love ${wrap("tree")}s. Why not more ${wrap("tree")}s? ${wrap("tree")} is good. The Modding ${wrap("tree")} is fun. Okay enough ${wrap("tree")}s now.` : "Buy me to reveal",
            cost: d(4),
            unlocked: () => hasUpgrade("p", 12)
        },
        14: {
            title: () => `Good resource name`,
            description: () => hasUpgrade("p", 14) ? `Rename points to ${wrap('tree')} points.` : "Buy me to reveal",
            cost: d(10),
            unlocked: () => hasUpgrade("p", 13)
        },
        15: {
            title: () => hasUpgrade("p", 15) ? `More... ${wrap('tree')}s?` : "???",
            description: () => hasUpgrade("p", 15) ? `No... I can see ${wrap('tree')}s... ${wrap("they're")} everywhere... Here and ${wrap('there') }... Even in the ${wrap("prestige")} button!!!` : "Buy me to reveal",
            cost: d(12),
            unlocked: () => hasUpgrade("p", 14)
        },

        21: {
            title: () => `More words`,
            description: () => `Unlock an input box`,
            cost: d(30),
            unlocked: () => hasUpgrade("p", 15),
            style: {height: "300px"}
        },
        22: {
            title: () => ``,
            description: () => `Hire ${wrap("peter")}, who helps you type more ${wrap("tree")}s`,
            cost: d(100),
            unlocked: () => tmp.p.showTabButton,
            style: peter_upgrade_style("500px")
        },

        31: {
            title: () => ``,
            description: () => `You remind ${wrap("peter")} that it's fine to copy & paste,<br> instead of typing ${wrap("letter")} by ${wrap("letter")}.`,
            effect() { return d(4) },
            effectDisplay() {
                return `${wrap("peter")} efficiency x${format(upgradeEffect(this.layer, this.id))}`
            },
            unlocked: () => hasUpgrade("p", 22),
            cost: d(10),
            currencyDisplayName: () => wrap("tree"),
            currencyInternalName: "typed_trees",
            currencyLayer: "p",
            style: peter_upgrade_style("500px")
        },

        32: {
            title: () => wrap("enter"),
            description: () => `Tell ${wrap("peter")} to write JS scripts, which auto ${wrap("enter")} ${wrap("tree")}s.`,
            unlocked: () => hasUpgrade("p", 31),
            cost: () => hasUpgrade("p", 33) ? d(1000) : d(200),
            style: peter_upgrade_style("242px")
        },

        33: {
            title: () => wrap("expert"),
            description: () => `Hire an ${wrap("expert")}, who hires more ${wrap("peter")} for you.`,
            unlocked: () => hasUpgrade("p", 31),
            cost: () => hasUpgrade("p", 32) ? d(1000) : d(200),
            style: peter_upgrade_style("242px")
        },

        34: {
            title: () => wrap("repeat"),
            description: () => `Improve ${wrap("peter")} efficiency based on ${wrap("tree")}s.`,
            unlocked: () => hasUpgrade("p", 32) && hasUpgrade("p", 33),
            cost: () => layers.p.improve_upg_costs[player.p.improve_upgs_bought],
            onPurchase() { player.p.improve_upgs_bought += 1 },
            effect() { return player.p.typed_trees.add(5).log(5) },
            effectDisplay() {
                return `x${format(upgradeEffect(this.layer, this.id))}`
            },
            style: peter_upgrade_style("113px", "160px")
        },

        35: {
            title: () => wrap("better"),
            description: () => `Improve JS script efficiency based on upgrades bought in this tab.`,
            unlocked: () => hasUpgrade("p", 32) && hasUpgrade("p", 33),
            cost: () => layers.p.improve_upg_costs[player.p.improve_upgs_bought],
            onPurchase() { player.p.improve_upgs_bought += 1 },
            effect() { 
                let upgs = d(4).add(player.p.improve_upgs_bought).add(player.p.enhance_upgs_bought) 
                if (hasUpgrade("p", 51))
                    upgs = upgs.add(1)
                if (hasUpgrade("p", 43))
                    upgs = upgs.mul(upgradeEffect("p", 43))
                if (hasUpgrade("p", 44))
                    upgs = upgs.mul(upgradeEffect("p", 44))
                
                return upgs.pow(0.8)
            },
            effectDisplay() {
                return `x${format(upgradeEffect(this.layer, this.id))}`
            },
            style: peter_upgrade_style("113px", "160px")
        },

        36: {
            title: () => wrap("recent"),
            description: () => `Buff ${wrap("prestige")} point gain based on time since last ${wrap("reset")}.`,
            unlocked: () => hasUpgrade("p", 32) && hasUpgrade("p", 33),
            cost: () => layers.p.improve_upg_costs[player.p.improve_upgs_bought],
            onPurchase() { player.p.improve_upgs_bought += 1 },
            effect() { 
                let t = d(player.p.resetTime).add(1)
                if (hasUpgrade("p", 45))
                    t = t.mul(upgradeEffect("p", 45))
                
                t = t.add(8).min(3600)
                return hasUpgrade("p", 46) ? t.sqrt() : t.cbrt() }
                ,
            effectDisplay() {
                return `x${format(upgradeEffect(this.layer, this.id))}`
            },
            style: peter_upgrade_style("113px", "160px")
        },

        37: {
            title: () => wrap("either"),
            description: () => `Alternately buff ${wrap("expert")} & ${wrap("peter")}s efficiency.`,
            unlocked: () => hasUpgrade("p", 32) && hasUpgrade("p", 33),
            cost: () => layers.p.improve_upg_costs[player.p.improve_upgs_bought],
            onPurchase() { player.p.improve_upgs_bought += 1 },
            effect() {
                let e1, e2;
                if (hasUpgrade("p", 47)) {
                    e1 = Math.sin(player.p.time_cnt / 5 * Math.PI) > 0 ? d(5) : d(1)
                    e2 = Math.sin(player.p.time_cnt / 5 * Math.PI) > 0 ? d(1) : d(5)
                } else {
                    e1 = d(Math.sin(player.p.time_cnt / 5 * Math.PI)).max(0).mul(4).add(1)
                    e2 = d(Math.sin(player.p.time_cnt / 5 * Math.PI + Math.PI)).max(0).mul(4).add(1)
                }
                if (hasUpgrade("p", 48)) {
                    e1 = e1.pow(2)
                    e2 = e2.pow(2)
                }

                if (tmp.p.meterResUnlocked[0] >= 2) {
                    let gain = clickableEffect("p", 23)
                    if (e1.gte(e2)) {
                        e1 = e1.mul(gain)
                    } else {
                        e2 = e2.mul(gain)
                    }
                }
                if (tmp.p.neitherUnlocked) {
                    e1 = e1.pow(tmp.p.neitherEffect)
                    e2 = e2.pow(tmp.p.neitherEffect)
                }
                return [e1, e2]
            },
            effectDisplay() {
                return `${wrap("expert")}: x${format(upgradeEffect(this.layer, this.id)[0])}, ${wrap("peter")}: x${format(upgradeEffect(this.layer, this.id)[1])}`
            },
            style: peter_upgrade_style("113px", "160px")
        },

        41: {
            description: () => `${wrap("repeat")} also buff ${wrap("expert")} at reduced rate`,
            effect() {
                return upgradeEffect(this.layer, 34).sqrt()
            },
            effectDisplay() {
                return `x${format(upgradeEffect(this.layer, this.id))}`
            },
            unlocked: () => player.p.improve_upgs_bought >= 4,
            cost: () => layers.p.enhance_upg_costs[player.p.enhance_upgs_bought],
            onPurchase() { player.p.enhance_upgs_bought += 1 },
            style: enhance_upgs_style
        },

        42: {
            description: () => `${wrap("repeat")} also buff JS scripts at reduced rate`,
            effect() {
                return upgradeEffect(this.layer, 34).cbrt()
            },
            effectDisplay() {
                return `x${format(upgradeEffect(this.layer, this.id))}`
            },
            unlocked: () => player.p.improve_upgs_bought >= 4,
            cost: () => layers.p.enhance_upg_costs[player.p.enhance_upgs_bought],
            onPurchase() { player.p.enhance_upgs_bought += 1 },
            style: enhance_upgs_style
        },

        43: {
            description: () => `In ${wrap("better")}, upgrades count more based on upgrades bought in this tab.`,
            effect() {
                return d(4).add(player.p.improve_upgs_bought).add(player.p.enhance_upgs_bought).sqrt()
            },
            effectDisplay() {
                return `x${format(upgradeEffect(this.layer, this.id))}`
            },
            unlocked: () => player.p.improve_upgs_bought >= 4,
            cost: () => layers.p.enhance_upg_costs[player.p.enhance_upgs_bought],
            onPurchase() { player.p.enhance_upgs_bought += 1 },
            style: enhance_upgs_style
        },

        44: {
            description: () => `In ${wrap("better")}, upgrades count more based on ${wrap("recent")}.`,
            effect() {
                return upgradeEffect("p", 36).add(1).sqrt()
            },
            effectDisplay() {
                return `x${format(upgradeEffect(this.layer, this.id))}`
            },
            unlocked: () => player.p.improve_upgs_bought >= 4,
            cost: () => layers.p.enhance_upg_costs[player.p.enhance_upgs_bought],
            onPurchase() { player.p.enhance_upgs_bought += 1 },
            style: enhance_upgs_style
        },

        45: {
            description: () => `${wrap("recent")} time is ${wrap("better")}.`,
            effect() {
                return upgradeEffect("p", 35).sqrt()
            },
            effectDisplay() {
                return `x${format(upgradeEffect(this.layer, this.id))}`
            },
            unlocked: () => player.p.improve_upgs_bought >= 4,
            cost: () => layers.p.enhance_upg_costs[player.p.enhance_upgs_bought],
            onPurchase() { player.p.enhance_upgs_bought += 1 },
            style: enhance_upgs_style
        },

        46: {
            description: () => `${wrap("recent")} formula is ${wrap("better")}.`,
            effectDisplay() {
                return `time^0.33 -> time^0.5`
            },
            unlocked: () => player.p.improve_upgs_bought >= 4,
            cost: () => layers.p.enhance_upg_costs[player.p.enhance_upgs_bought],
            onPurchase() { player.p.enhance_upgs_bought += 1 },
            style: enhance_upgs_style
        },
        
        47: {
            description: () => `${wrap("either")} is no longer sin but square wave.`,
            unlocked: () => player.p.improve_upgs_bought >= 4,
            cost: () => layers.p.enhance_upg_costs[player.p.enhance_upgs_bought],
            onPurchase() { player.p.enhance_upgs_bought += 1 },
            style: enhance_upgs_style
        },
        
        48: {
            description: () => `${wrap("either")} is stronger.`,
            effectDisplay() {
                return `^2`
            },
            unlocked: () => player.p.improve_upgs_bought >= 4,
            cost: () => layers.p.enhance_upg_costs[player.p.enhance_upgs_bought],
            onPurchase() { player.p.enhance_upgs_bought += 1 },
            style: enhance_upgs_style
        },

        51: {
            description: () => `THIS HAS TO STOP.<br>
                Unlock ${wrap("meter")}`,
            
            unlocked: () => player.p.improve_upgs_bought >= 4 || hasUpgrade("p", 51),
            cost: d("1e8"),
            style: peter_upgrade_style("500px"),
            onPurchase() { player.p.meter_unlocked = true }
        }

    },

    meterGain() {
        if (player.p.typed_trees.lte(d("1e13"))) return d(0)
        let amount = player.p.typed_trees.div(d("1e13"))
        amount = amount.pow(0.5)

        let mult = d(1)
        let exp = d(1)

        if (tmp.p.meteorUnlocked) {
            mult = mult.div(tmp.p.meteorEffect)
        }
        
        if (tmp.p.eternalUnlocked) {
            mult = mult.div(tmp.p.eternitiesEffect)
        }
        amount = amount.mul(mult).pow(exp)
        return amount
    },

    meterEffect() {
        let eff = d(player.p.meters).add(1.5).log(1.5).pow(2)
        return eff
    },

    meterResUnlocked() {
        let res_requires = [d(0), d(10), d(200), d(1000), d(100000)]

        for (let i = 4; i >= 0; i--) {
            if (player.p.best_meters.gte(res_requires[i])) return [i+1, res_requires[i+1]]
        }
    },

    isRes0: () => player.p.cur_converting == 0,
    isRes1: () => player.p.cur_converting == 1,
    isRes2: () => player.p.cur_converting == 2,
    isRes3: () => player.p.cur_converting == 3,
    isRes4: () => player.p.cur_converting == 4,


    clickables: {
        11: {
            display() {
                if (player.p.typed_trees.gte("1e13")) {
                    return `${wrap("reset")} ${res_styled_text(format(player.p.typed_trees), layers.p.tree_color, "black")} ${wrap("trees")} <br>for ${res_styled_text(format(tmp.p.meterGain), layers.p.meter_color, "black")} ${wrap("meter")}s`
                }
                
                return `Require: ${res_styled_text(format(player.p.typed_trees), layers.p.tree_color)} / ${res_styled_text(format(d("1e13")), layers.p.tree_color)} ${wrap("trees")}`
            },
            unlocked: true,
            canClick: () => player.p.typed_trees.gte(d("1e13")),
            onClick: () => {
                player.p.meters = player.p.meters.add(tmp.p.meterGain)

                player.p.peters = d(1)
                player.p.jsscripts = d(0)
                player.p.typed_trees = d(0)
                player.p.points = d(0)
                player.points = d(0)

                if (tmp.p.meterResUnlocked[0] == 3) {
                    player.p.upgrades = [11, 12, 13, 14, 15, 21, 22, 31, 32, 33, 34, 35, 36, 37, 51]
                    player.p.improve_upgs_bought = 4
                    player.p.enhance_upgs_bought = 0
                } else {
                    if (tmp.p.meterResUnlocked[0] < 3) {
                        player.p.upgrades = [11, 12, 13, 14, 15, 21, 22, 51]
                        player.p.improve_upgs_bought = 0
                        player.p.enhance_upgs_bought = 0
                    }
                }
            },
            style: () => {
                let can = tmp.p.clickables[11].canClick
                return {
                    "background": can ? layers.p.color : "transparent",
                    "width": "300px",
                    "height": "140px",
                    "color": can ? "black" : "#95a5a6",
                    "border": `1px ${can ? "#636e72" : "#95a5a6"} solid`,
                    "border-radius": "0px",
                    "box-shadow": `2px 2px 0px ${can ? "#636e72" : "#95a5a6"}`,
                    "font-size": "14px",
                }
            }
        },

        12: {
            ind: 0,
            res: "cm",
            dispn: () => "centi" + wrap("meter"),
            display() { return meter_res_display_helper(this.ind, this.dispn()) },
            unlocked: true,
            onClick() {
                if (player.p.cur_converting === this.ind)
                    player.p.cur_converting = -1
                else 
                    player.p.cur_converting = this.ind
                
                layers.p.trackLastClickId(player.p.cur_converting)
            },
            canClick: () => player.p.meters.gt(0),
            style() { return meter_style_helper(this.ind) }
        },

        22: {
            ind: 0,
            res: "cm",
            dispn: () => "centi" + wrap("meter"),
            canClick: false,
            unlocked: true,
            display() {
                return `${res_styled_text(format(meteorRes(player.p[this.res])), layers.p.meter_res_color)}<br>${this.dispn()}<br>
                    which boost
                    ${wrap("expert")} <br><br>x${res_styled_text(format(clickableEffect("p", this.id)), layers.p.meter_res_color)}`
            },
            effect() {
                let r = meteorRes(player.p.cm)
                eff = r.div(5).add(5).log(5).pow(2)
                if (tmp.p.meterResUnlocked[0] >= 5)
                    eff = eff.mul(clickableEffect("p", 26))
                return eff
            },
            style: meter_res_display_style
        },

        13: {
            ind: 1,
            res: "km",
            dispn: () => "kilo" + wrap("meter"),
            display() { return meter_res_display_helper(this.ind, this.dispn()) },
            unlocked: () => tmp.p.meterResUnlocked[0] >= 2,
            onClick() {
                if (player.p.cur_converting === this.ind)
                    player.p.cur_converting = -1
                else 
                    player.p.cur_converting = this.ind

                layers.p.trackLastClickId(player.p.cur_converting)
            },
            canClick: () => player.p.meters.gt(0),
            style() { return meter_style_helper(this.ind) }
        },

        23: {
            ind: 1,
            res: "km",
            dispn: () => "kilo" + wrap("meter"),
            canClick: false,
            unlocked: () => tmp.p.meterResUnlocked[0] >= 2,
            display() {
                return `${res_styled_text(format(meteorRes(player.p[this.res])), layers.p.meter_res_color)}<br>${this.dispn()}<br>
                    which boost
                    ${wrap("either")} <br><br>x${res_styled_text(format(clickableEffect("p", this.id)), layers.p.meter_res_color)} <br>
                    (based on ${wrap("prestige")} point)`
            },
            effect() {
                let r = meteorRes(player.p.km)
                eff = r.mul(player.p.points).add(10).log(10).pow(1.2)
                if (tmp.p.meterResUnlocked[0] >= 5)
                    eff = eff.mul(clickableEffect("p", 26))
                return eff
            },
            style: meter_res_display_style
        },

        14: {
            ind: 2,
            res: "nm",
            dispn: () => "nano" + wrap("meter"),
            display() { return meter_res_display_helper(this.ind, this.dispn()) },
            unlocked: () => tmp.p.meterResUnlocked[0] >= 3,
            onClick() {
                if (player.p.cur_converting === this.ind)
                    player.p.cur_converting = -1
                else 
                    player.p.cur_converting = this.ind
                    
                layers.p.trackLastClickId(player.p.cur_converting)
            },
            canClick: () => player.p.meters.gt(0),
            style() { return meter_style_helper(this.ind) }
        },

        24: {
            ind: 2,
            res: "nm",
            dispn: () => "nano" + wrap("meter"),
            canClick: false,
            unlocked: () => tmp.p.meterResUnlocked[0] >= 3,
            display() {
                return `${res_styled_text(format(meteorRes(player.p[this.res])), layers.p.meter_res_color)}<br>${this.dispn()}<br>
                    which boost
                    ${wrap("prestige")} point <br><br>^${res_styled_text(format(clickableEffect("p", this.id)), layers.p.meter_res_color)}`
            },
            effect() {
                let r = meteorRes(player.p.nm)
                eff = r.div(100000)
                if (tmp.p.meterResUnlocked[0] >= 5)
                    eff = eff.mul(clickableEffect("p", 26))
                return eff.add(1).log(10).div(20).add(1)
            },
            style: meter_res_display_style
        },

        15: {
            ind: 3,
            res: "pm",
            dispn: () => "para" + wrap("meter"),
            display() { return meter_res_display_helper(this.ind, this.dispn()) },
            unlocked: () => tmp.p.meterResUnlocked[0] >= 4,
            onClick() {
                if (player.p.cur_converting === this.ind)
                    player.p.cur_converting = -1
                else 
                    player.p.cur_converting = this.ind
                    
                layers.p.trackLastClickId(player.p.cur_converting)
            },
            canClick: () => player.p.meters.gt(0),
            style() { return meter_style_helper(this.ind) }
        },

        25: {
            ind: 3,
            res: "pm",
            dispn: () => "para" + wrap("meter"),
            canClick: false,
            unlocked: () => tmp.p.meterResUnlocked[0] >= 4,
            display() {
                return `${res_styled_text(format(meteorRes(player.p[this.res])), layers.p.meter_res_color)}<br>${this.dispn()}<br>
                    which boost
                    JS script <br><br>^${res_styled_text(format(clickableEffect("p", this.id)), layers.p.meter_res_color)}<br>
                    (based on ${wrap("peter")})`
            },
            effect() {
                let r = meteorRes(player.p.pm)
                let eff = r.mul(player.p.peters)
                if (tmp.p.meterResUnlocked[0] >= 5)
                    eff = eff.mul(clickableEffect("p", 26))
                return eff.add(1).log(10).div(50).add(1)
            },
            style: meter_res_display_style
        },

        16: {
            ind: 4,
            res: "metre",
            dispn: () => wrap("metre"),
            display() { return meter_res_display_helper(this.ind, this.dispn()) },
            unlocked: () => tmp.p.meterResUnlocked[0] >= 5,
            onClick() {
                if (player.p.cur_converting === this.ind)
                    player.p.cur_converting = -1
                else 
                    player.p.cur_converting = this.ind
                    
                layers.p.trackLastClickId(player.p.cur_converting)
            },
            canClick: () => player.p.meters.gt(0),
            style() { return meter_style_helper(this.ind) }
        },

        26: {
            ind: 4,
            res: "metre",
            dispn: () => wrap("metre"),
            canClick: false,
            unlocked: () => tmp.p.meterResUnlocked[0] >= 5,
            display() {
                return `${res_styled_text(format(player.p[this.res]), layers.p.meter_res_color)}<br>${this.dispn()}<br>
                    which boost
                    all left ????${wrap("meter")}s <br><br>x${res_styled_text(format(clickableEffect("p", this.id)), layers.p.meter_res_color)}`
            },
            effect() {
                let r = meteorRes(player.p.metre)
                return r.div(1000).add(1).log(20).add(1).pow(1.2)
            },
            style: meter_res_display_style
        },
    },
    trackLastClickId(id) {
        player.p.last_click_ids.push(id)
        if (player.p.last_click_ids.length > 4) {
            player.p.last_click_ids.shift()
        }
        if (player.p.last_click_ids[0] != 2) return
        if (player.p.last_click_ids[1] != 4) return
        if (player.p.last_click_ids[2] != 1) return
        if (player.p.last_click_ids[3] != 3) return
        player.s.secret3_unlocked = true
    },

    resetDescription: () => {
        return hasUpgrade("p", 11) ? wrap("reset") + " for " : "Reset for "
    } ,
    color: "#95a5a6",
    tree_color: "#2ecc71",
    js_color: "#9b59b6",
    peter_color: "#1abc9c",
    meter_color: "#fdcb6e",
    meter_res_color: "#95a5a6",
    ether_color: "#6c5ce7",
    eternity_color: "#4834d4",
    eater_color: "#eb4d4b",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: () => wrap("prestige") + " points", // Name of prestige currency
    baseResource: () => tmp.p.pointsName, // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        
        if (hasUpgrade("p", 36)) mult = mult.mul(upgradeEffect("p", 36))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = d(1)
        if (tmp.p.meterResUnlocked[0] >= 3)
            exp = clickableEffect("p", 24)
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    submitText() {
        let input = player.p.text_input.trim().toLowerCase()
        if (input.length == 0) return

        if (input == "present") {
            player.s.secret4_unlocked = true
        }

        player.p.total_texts.push(input)
        player.p.text_input = ""
        if (player.p.total_texts.length > 100) {
            player.p.total_texts.shift()
        }
    },

    buyables: {
        11: {
            title: () => wrap("three"),
            cost(x) {
                let c = d(15).add(d(0.05).mul(x)).pow(x).mul(20)
                return c
            },
            display() {
                let cur_amount = getBuyableAmount(this.layer, this.id)
                let cost = this.cost(cur_amount)
                let eff = buyableEffect(this.layer, this.id)
                let ret = `<br>${wrap("ether")} gain ${res_styled_text("x"+format(eff), layers.p.ether_color, "black")}<br><br>`
                ret += `Next: ${res_styled_text(format(cost), layers.p.ether_color, "black")} ${wrap("ether")}`
                return ret
            },
            unlocked() {
                return player.p.ethers.gt(0) && player.p.eater.lte(1)
            },
            effect() {
                let cur_amount = getBuyableAmount(this.layer, this.id)
                let base = d(3)
                if (getBuyableAmount("p", 23).gt(0))
                    base = base.div(buyableEffect("p", 23)[1])
                return base.pow(cur_amount).pow(0.9)
            },
            canAfford() { return player[this.layer].ethers.gte(this.cost(getBuyableAmount(this.layer, this.id))) },
            buy() {
                player[this.layer].ethers = player[this.layer].ethers.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: ether_buyable_style,
            useCanClass: 1
        },

        12: {
            title: () => wrap("thirteen"),
            cost(x) {
                let c = d(636).add(d(100).mul(x)).pow(x).mul(50)
                return c
            },
            display() {
                let cur_amount = getBuyableAmount(this.layer, this.id)
                let cost = this.cost(cur_amount)
                let eff = buyableEffect(this.layer, this.id)
                let ret = `<br>${wrap("ether")} gain ${res_styled_text("x"+format(eff), layers.p.ether_color, "black")}<br><br>`
                ret += `Next: ${res_styled_text(format(cost), layers.p.ether_color, "black")} ${wrap("ether")}`
                return ret
            },
            unlocked() {
                return player.p.ethers.gt(0) && player.p.eater.lte(1)
            },
            effect() {
                let cur_amount = getBuyableAmount(this.layer, this.id)
                let base = d(13)
                if (getBuyableAmount("p", 23).gt(0))
                    base = base.div(buyableEffect("p", 23)[1])
                return base.pow(cur_amount).pow(0.9)
            },
            canAfford() { return player[this.layer].ethers.gte(this.cost(getBuyableAmount(this.layer, this.id))) },
            buy() {
                player[this.layer].ethers = player[this.layer].ethers.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: ether_buyable_style,
            useCanClass: 1
        },

        13: {
            title: () => wrap("ethernet"),
            cost(x) {
                let c = d(1000000).add(d(200000).mul(x)).pow(x).mul(d(10000))
                return c
            },
            display() {
                let cur_amount = getBuyableAmount(this.layer, this.id)
                let cost = this.cost(cur_amount)
                let eff = buyableEffect(this.layer, this.id)
                let ret = `<br>${wrap("ether")} gain ${res_styled_text("x"+format(eff), layers.p.ether_color, "black")}<br><br>`
                ret += `Next: ${res_styled_text(format(cost), layers.p.ether_color, "black")} ${wrap("ether")}`
                return ret
            },
            unlocked() {
                return player.p.ethers.gt(0) && player.p.eater.lte(1)
            },
            effect() {
                let cur_amount = getBuyableAmount(this.layer, this.id)

                let ether = player.p.ethers.add(3).log(3).pow(0.9)
                if (getBuyableAmount("p", 23).gt(0))
                    ether = ether.div(buyableEffect("p", 23)[1])
                return d(ether).pow(cur_amount)
            },
            canAfford() { return player[this.layer].ethers.gte(this.cost(getBuyableAmount(this.layer, this.id))) },
            buy() {
                player[this.layer].ethers = player[this.layer].ethers.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: ether_buyable_style,
            useCanClass: 1
        },

        21: {
            title: () => wrap("revert"),
            cost(x) {
                let c = d(10).add(d(1).mul(x.add(1).pow(1.15).add(d(1.18).pow(x).mul(0.01)))).pow(x).mul(10)
                return c
            },
            display() {
                let cur_amount = getBuyableAmount(this.layer, this.id)
                let cost = this.cost(cur_amount)
                let eff = buyableEffect(this.layer, this.id)
                let ret = `<br>${wrap("eater")} gain ${res_styled_text("x" + format(eff[0]), layers.p.eater_color, "black")}<br>`

                ret += `${wrap("eternities")} ${res_styled_text("/" + format(eff[1]), layers.p.eternity_color, "black")} per second<br><br>`

                ret += `Next: ${res_styled_text(format(cost), layers.p.eater_color, "black")} ${wrap("eater")}`
                return ret
            },
            unlocked() {
                return player.p.eater.gt(0)
            },
            effect() {
                let x = getBuyableAmount(this.layer, this.id)

                let e = player.p.eater.add(2).log(2)
                let eater_eff = e.add(25).log(5).pow(x)
                let other_eff = d(x.mul(0.3).add(6)).pow(x)
                return [eater_eff, other_eff]
            },
            canAfford() { return player[this.layer].eater.gte(this.cost(getBuyableAmount(this.layer, this.id))) },
            buy() {
                player[this.layer].eater = player[this.layer].eater.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: ether_buyable_style,
            useCanClass: 2
        },

        22: {
            title: () => wrap("retreat"),
            cost(x) {
                let c = d(1337).add(x.add(1).pow(2).mul(40).add(d(1.35).pow(x).mul(100))).pow(x).mul(25)
                return c
            },
            display() {
                let cur_amount = getBuyableAmount(this.layer, this.id)
                let cost = this.cost(cur_amount)
                let eff = buyableEffect(this.layer, this.id)
                let ret = `<br>${wrap("eater")} gain ${res_styled_text("x"+format(eff[0]), layers.p.eater_color, "black")}<br><br>`

                ret += `${wrap("ether")} gain ${res_styled_text("/" + format(eff[1]), layers.p.ether_color, "black")}<br><br>`

                ret += `Next: ${res_styled_text(format(cost), layers.p.eater_color, "black")} ${wrap("eater")}`
                return ret
            },
            unlocked() {
                return player.p.eater.gt(0)
            },
            effect() {
                let x = getBuyableAmount(this.layer, this.id)

                let e = player.p.eater.add(64).log(8).sqrt()
                let e2 = tmp.p.meterGain.add(1.5).log(1.5).sqrt()
                
                let eater_eff = e.mul(e2).pow(x)
                let other_eff = d(x.add(10)).pow(x)

                return [eater_eff, other_eff]
            },
            canAfford() { return player[this.layer].eater.gte(this.cost(getBuyableAmount(this.layer, this.id))) },
            buy() {
                player[this.layer].eater = player[this.layer].eater.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: ether_buyable_style,
            useCanClass: 2
        },

        23: {
            title: () => wrap("overeat"),
            cost(x) {
                let c = d(x.pow(2).mul(100).add(1000).add(d(1.4).pow(x).mul(100))).pow(x).mul(1000)
                return c
            },
            display() {
                let cur_amount = getBuyableAmount(this.layer, this.id)
                let cost = this.cost(cur_amount)
                let eff = buyableEffect(this.layer, this.id)
                let ret = `<br>${wrap("eater")} gain ${res_styled_text("x"+format(eff[0]), layers.p.eater_color, "black")}<br><br>`

                ret += `All ${wrap("ether")} buyables ${res_styled_text("/" + format(eff[1]), layers.p.ether_color, "black")} weaker<br><br>`
                ret += `Next: ${res_styled_text(format(cost), layers.p.eater_color, "black")} ${wrap("eater")}`
                return ret
            },
            unlocked() {
                return player.p.eater.gt(0)
            },
            effect() {
                let x = getBuyableAmount(this.layer, this.id)

                let e = tmp.p.meterGain.add(2).log(2)
                let eater_eff = e.sqrt().pow(x)
                let other_eff = x.mul(0.02).add(1)

                return [eater_eff, other_eff]
            },
            canAfford() { return player[this.layer].eater.gte(this.cost(getBuyableAmount(this.layer, this.id))) },
            buy() {
                player[this.layer].eater = player[this.layer].eater.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: ether_buyable_style,
            useCanClass: 2
        },
    },

    textUnlocked: () => hasUpgrade("p", 21) ,
    tabFormat: {
        "reset": {
            content: [
                "main-display",
                "prestige-button", "resource-display",
                "blank",
                ["upgrades", [1]],
                "blank",
                ["row", [
                    ["upgrade", 21],
                    ["column", [
                        ["text-input", ["text_input", "textUnlocked", true]],
                        ["display-text", [() => {
                            return tmp.p.totalTextParse[0]
                        }, () => {
                            return {
                                opacity: tmp.p.textUnlocked ? "1" : "0",
                                width: "500px",
                                padding: "7px",
                                height: "200px",
                                "margin-left": "20px",
                                "margin-right": "20px",
                                border: "5px #95a5a6 solid",
                                "text-align": "center",
                                "vertical-align": "middle",
                                display: "flex",
                                "word-break": "break-all"
                            }  
                        }]]
                    ]]
                ]],
                "blank",
                "blank"
            ],
            unlocked: true,
            dispn: () => wrap("reset")
        },

        "peter": {
            content: [
                "main-display",
                "prestige-button", "resource-display",
                "blank",
                ["display-text", function() {
                    let text = ""

                    if (hasUpgrade("p", 22)) {
                        if (hasUpgrade("p", 33))
                            text += `You have hired${player.p.meter_unlocked ? " " + res_styled_text(format(clickableEffect("p", 22)), layers.p.peter_color) : ""} ${wrap('expert')}, who hire ${res_styled_text(formatWhole(tmp.p.peterGain), layers.p.peter_color)} ${wrap("peter")}s per second.<br>`
                        
                        text += `You have hired ${hasUpgrade("p", 33) ? res_styled_text(formatWhole(player.p.peters.add(1)), layers.p.peter_color) + " " + wrap("peters") : wrap("peter")}, `

                        if (hasUpgrade("p", 32))
                            text += `writing ${res_styled_text(formatWhole(tmp.p.jsscriptGain), layers.p.js_color)} JS scripts per second.<br>`
                        else
                            text += `You have hired ${wrap('peter')}, typing ${res_styled_text(format(tmp.p.treeGain), layers.p.tree_color)} ${wrap("trees")} per second.<br>`

                        if (hasUpgrade("p", 32))
                            text += `You have ${res_styled_text(formatWhole(player.p.jsscripts), layers.p.js_color)} JS scripts, auto ${wrap("enter")}ing ${res_styled_text(formatWhole(tmp.p.treeGain), layers.p.tree_color)} ${wrap("trees")} per second.<br>`
                    }

                    if (hasUpgrade("p", 22))
                        text += `You have typed ${res_styled_text(formatWhole(player.p.typed_trees), layers.p.tree_color)} ${wrap('trees')}.`
                    return text
                }],
                "blank",
                ["upgrade", 22],
                "blank",
                ["upgrade", 31],
                "blank",
                ["row", [
                    ["upgrade", 32],
                    ["blank", ["16px", "10px"]],
                    ["upgrade", 33]]
                ],
                "blank",
                ["row", [
                    ["upgrade", 34], 
                    ["blank", ["16px", "10px"]], 
                    ["upgrade", 35],
                    ["blank", ["16px", "10px"]], 
                    ["upgrade", 36],
                    ["blank", ["16px", "10px"]], 
                    ["upgrade", 37],
                ]],
                "blank",
                ["row", [
                    ["upgrade", 41], 
                    ["column", [["blank", ["16px", "10px"]], ["display-text", "<span class='presentcode'>p</span>"]]], 
                    ["upgrade", 42],
                    ["column", [["blank", ["16px", "10px"]], ["display-text", "<span class='presentcode'>r</span>"]]], 
                    ["upgrade", 43],
                    ["column", [["blank", ["16px", "10px"]], ["display-text", "<span class='presentcode'>e</span>"]]], 
                    ["upgrade", 44], 
                    ["column", [["blank", ["16px", "10px"]], ["display-text", "<span class='presentcode'>s</span>"]]], 
                    ["upgrade", 45],
                    ["column", [["blank", ["16px", "10px"]], ["display-text", "<span class='presentcode'>e</span>"]]], 
                    ["upgrade", 46],
                    ["column", [["blank", ["16px", "10px"]], ["display-text", "<span class='presentcode'>n</span>"]]], 
                    ["upgrade", 47],
                    ["column", [["blank", ["16px", "10px"]], ["display-text", "<span class='presentcode'>t</span>"]]], 
                    ["upgrade", 48],
                ]],
                "blank",
                ["upgrade", 51],
                "blank",
            ],
            unlocked: () => tmp.p.showTabButton,
            dispn: () => wrap("peter")
        },

        "meter": {
            content: [
                "main-display",
                "blank",
                ["clickable", 11],
                ["blank", "30px"],
                ["display-text", function() {
                    let text = ""
                    if (player.p.best_meters.gte(d(100000)) && player.p.best_meters.lte(d("1e8"))) {
                        text += `At ${res_styled_text("1e8", layers.p.meter_color)} ${wrap("meter")}s, unlock a new tab<br><br>`
                    }

                    text += `You have ${res_styled_text(format(player.p.meters), layers.p.meter_color)} ${wrap("meter")}s, which boost ${wrap("trees")} gain ${res_styled_text("x"+format(tmp.p.meterEffect), layers.p.meter_color)}`

                    let unlk_stat = tmp.p.meterResUnlocked
                    if (unlk_stat[1]) {
                        text += `<br><br>Reach ${res_styled_text(format(unlk_stat[1]), layers.p.meter_color)} ${wrap("meter")}s to unlock next resource, <br>
                        (and will ${meter_qol_desc[unlk_stat[0]]()})`
                    }
                    return text
                }],
                "blank",
                ["row", [
                    ["column", [
                        ["clickable", 12],
                        ["arrow", ["isRes0", 12]],
                        ["clickable", 22]
                    ]],
                    ["blank", [() => tmp.p.clickables[13].unlocked ? "20px" : "0px", "20px"]],
                    ["column", [
                        ["clickable", 13],
                        ["arrow", ["isRes1", 13]],
                        ["clickable", 23]
                    ]],
                    ["blank", [() => tmp.p.clickables[14].unlocked ? "20px" : "0px", "20px"]],
                    ["column", [
                        ["clickable", 14],
                        ["arrow", ["isRes2", 14]],
                        ["clickable", 24]
                    ]],
                    ["blank", [() => tmp.p.clickables[15].unlocked ? "20px" : "0px", "20px"]],
                    ["column", [
                        ["clickable", 15],
                        ["arrow", ["isRes3", 15]],
                        ["clickable", 25]
                    ]],
                    ["blank", [() => tmp.p.clickables[16].unlocked ? "20px" : "0px", "20px"]],
                    ["column", [
                        ["clickable", 16],
                        ["arrow", ["isRes4", 16]],
                        ["clickable", 26]
                    ]],


                ]]
            ],
            unlocked: () => player.p.meter_unlocked,
            dispn: () => wrap("meter")
        },

        "ether": {
            content: [ 
                "main-display",
                "blank",
                ["ether-main", function() {
                    if (!tmp.p.eaterUnlocked)
                        return `You have ${res_styled_text(formatWhole(player.p.ethers), layers.p.ether_color, "black")} ${wrap("ether")}`
                    else 
                        return `You have ${res_styled_text(formatWhole(player.p.eater), layers.p.eater_color, "black")} ${wrap("eater")}`

                }],
                "blank",
                ["display-text", function() {
                    let text = ""

                    if (tmp.p.eaterUnlocked) {
                        text += `You gain ${res_styled_text(format(tmp.p.eaterGain), layers.p.eater_color)} ${wrap("eater")}/s, eating ${res_styled_text(format(d(1).sub(tmp.p.eaterEffect).mul(100)) + "%/s", layers.p.eater_color)} ${wrap("ether")}<br>`

                        text += `You have ${res_styled_text(formatWhole(player.p.ethers), layers.p.ether_color, "black")} ${wrap("ether")}<br><br>`
                    }

                    if (!tmp.p.eaterUnlocked && player.p.ethers.gte("1e50")) {
                        text += `Reach ${res_styled_text(format(player.p.ethers), layers.p.ether_color)}/${res_styled_text("5.4e54", layers.p.ether_color)} ${wrap("ether")} to gain ${wrap("eater")}s<br><br>`
                    }

                    if (player.p.best_meters.lt(d("1e9"))) {
                        text += `Reach ${res_styled_text(format(player.p.meters), layers.p.meter_color)}/${res_styled_text("1e9", layers.p.meter_color)} ${wrap("meter")}s to gain ${wrap("ether")}s`
                        return text
                    }
                    
                    text += `Your ${res_styled_text(format(player.p.meters), layers.p.meter_color)} ${wrap("meter")}s generating ${res_styled_text(formatWhole(tmp.p.etherGain), layers.p.ether_color)} ${wrap("ether")}/s<br>`

                    if (tmp.p.retireUnlocked) { // balance cost
                        let c = player.p.ethers.gte(1000) ? layers.p.ether_color : layers.p.eater_color

                        text += `${wrap("retire")}: ${wrap("ether")} ${res_styled_text("x" + format(tmp.p.retireBuff), c)}, but divides ${wrap("peter")}s & ${wrap("expert")}s: ${res_styled_text("/" + format(tmp.p.retireEffect), c)}<br>`
                    }

                    if (tmp.p.neitherUnlocked) { // balance cost
                        let c = player.p.ethers.gte(d("1e15")) ? layers.p.ether_color : layers.p.eater_color

                        text += `${wrap("neither")}: ${wrap("ether")} ${res_styled_text("x" + format(tmp.p.neitherBuff), c)}, but roots ${wrap("either")} effect: ${res_styled_text("^" + format(tmp.p.neitherEffect), c)}<br>`
                    }

                    if (tmp.p.meteorUnlocked) { // balance cost
                        let c = player.p.ethers.gte(d("1e22")) ? layers.p.ether_color : layers.p.eater_color

                        text += `${wrap("meteor")}: ${wrap("ether")} ${res_styled_text("x" + format(tmp.p.meteorBuff), c)}, but divides all ${wrap("meter")} resources: ${res_styled_text("/" + format(tmp.p.meteorEffect), c)}<br>`
                    }
                    
                    if (tmp.p.eternalUnlocked) { // balance cost
                        let c = player.p.eternities.gte(1) ? layers.p.eternity_color : layers.p.eater_color

                        text += `${wrap("eternal")}: ${wrap("ether")} multiplies ${wrap("eternities")}, by ${res_styled_text("x"+format(tmp.p.eternityGain), layers.p.eternity_color)} per second.<br>`

                        text += `You have  ${res_styled_text(format(player.p.eternities), c)} ${wrap("eternities")}: ${wrap("ether")} ${res_styled_text("x" + format(tmp.p.eternitiesBuff), c)}, but dividing various resources by ${res_styled_text("/" + format(tmp.p.eternitiesEffect), c)}<br>`
                    }

                    if (!tmp.p.eternalUnlocked && tmp.p.meteorUnlocked)
                        text += `Next effect at ${res_styled_text(format(layers.p.ether_reqs[3]), layers.p.ether_color)} ${wrap("ether")}<br>`
                    
                    if (!tmp.p.meteorUnlocked && tmp.p.neitherUnlocked)
                        text += `Next effect at ${res_styled_text(format(layers.p.ether_reqs[2]), layers.p.ether_color)} ${wrap("ether")}<br>`
                        
                    if (!tmp.p.neitherUnlocked && tmp.p.retireUnlocked)
                        text += `Next effect at ${res_styled_text(format(layers.p.ether_reqs[1]), layers.p.ether_color)} ${wrap("ether")}<br>`

                    if (!tmp.p.retireUnlocked)
                        text += `Unlock ${wrap("ether")} effect at ${res_styled_text(format(layers.p.ether_reqs[0]), layers.p.ether_color)}<br>`
                    return text
                }],
                "blank",
                ["buyables", [2]],
                "blank",
                ["buyables", [1]],
                "blank",
            ],
            unlocked: () => player.p.best_meters.gte(d("1e8")),
            dispn: () => wrap("ether")
        }
    },

    peterGain() {
        if (!hasUpgrade("p", 33)) return d(0)
        let gain = d(1)
        if (player.p.meter_unlocked)
            gain = gain.mul(clickableEffect("p", 22))
        
        if (hasUpgrade("p", 37)) gain = gain.mul(upgradeEffect("p", 37)[0])
        if (hasUpgrade("p", 41)) gain = gain.mul(upgradeEffect("p", 41))

        if (tmp.p.retireUnlocked) gain = gain.div(tmp.p.retireEffect)
        return gain
    },

    jsscriptGain() {
        if (!hasUpgrade("p", 32)) return d(0)
        let gain = player.p.peters
        if (hasUpgrade("p", 34)) gain = gain.mul(upgradeEffect("p", 34))
        if (hasUpgrade("p", 37)) gain = gain.mul(upgradeEffect("p", 37)[1])

        if (tmp.p.meterResUnlocked[0] >= 4) {
            gain = gain.pow(clickableEffect("p", 25))
        }
        if (tmp.p.retireUnlocked) gain = gain.div(tmp.p.retireEffect)
        return gain
    },

    treeGain() {
        if (!hasUpgrade("p", 22)) return d(0)
        let tree_gain = d(0.5)
        
        tree_gain = tree_gain.mul(hasUpgrade("p", 32) ? player.p.jsscripts : player.p.peters)

        if (hasUpgrade("p", 31)) tree_gain = tree_gain.mul(upgradeEffect("p", 31))
        if (hasUpgrade("p", 35)) tree_gain = tree_gain.mul(upgradeEffect("p", 35))
        if (hasUpgrade("p", 42)) tree_gain = tree_gain.mul(upgradeEffect("p", 42))

        tree_gain = tree_gain.mul(tmp.p.meterEffect)
        return tree_gain
    },
    
    etherGain() {
        if (!player.p.best_meters.gt(d("1e9"))) return d(0)

        let gain = d(1)
        
        if (getBuyableAmount("p", 11).gt(0)) {
            gain = gain.mul(buyableEffect("p", 11))
        }
        if (getBuyableAmount("p", 12).gt(0)) {
            gain = gain.mul(buyableEffect("p", 12))
        }
        if (getBuyableAmount("p", 13).gt(0)) {
            gain = gain.mul(buyableEffect("p", 13))
        }

        if (tmp.p.retireUnlocked) gain = gain.mul(tmp.p.retireBuff)
        if (tmp.p.neitherUnlocked) gain = gain.mul(tmp.p.neitherBuff)
        if (tmp.p.meteorUnlocked) gain = gain.mul(tmp.p.meteorBuff)
        if (tmp.p.eternalUnlocked) gain = gain.mul(tmp.p.eternitiesBuff)

        if (getBuyableAmount("p", 22).gt(0)) {
            gain = gain.div(buyableEffect("p", 22)[1])
        }
        return gain
    },

    ether_reqs: [d(1000), d("1e15"), d("1e22"), d("1e35")],

    retireUnlocked() { return player.p.best_ethers.gte(layers.p.ether_reqs[0]) },
    neitherUnlocked() { return player.p.best_ethers.gte(layers.p.ether_reqs[1]) },
    meteorUnlocked() { return player.p.best_ethers.gte(layers.p.ether_reqs[2]) },
    eternalUnlocked() { return player.p.best_ethers.gte(layers.p.ether_reqs[3]) },

    retireEffect() {
        let e = player.p.ethers
        if (e.gte(d(1000))) {
            e = e.div(1000).add(9).log(10)
            return e
        } else {
            e = d(1000).div(e).add(9).log(10)
            return d(1).div(e)
        }
    },

    neitherEffect() {
        let e = player.p.ethers
        if (e.gte(d("1e15"))) {
            e = e.div(d("1e15")).log(100).div(100).add(1)
            return d(1).div(e)
        } else {
            e = d("1e15").div(e).log(100).div(100).add(1)
            return e
        }
    },

    meteorEffect() {
        let e = player.p.ethers
        if (e.gte(d("1e22"))) {
            e = e.div(d("1e22")).log(100).add(1).pow(2)
            return e
        } else {
            e = d("1e22").div(e).log(100).add(1).pow(2)
            return d(1).div(e)
        }
    },

    eternityGain() {
        let gain = tmp.p.etherGain.div(d(1e22))
        return gain.pow(0.1)
    },

    eternitiesEffect() {
        let et = player.p.eternities.log(10).div(100)
        if (et.lte(0))
            et = et.div(2)
        et = d(2).pow(et)
        return et
    },

    retireBuff() {
        let e = player.p.ethers.log(2).max(1).log(2).max(1)
        return e
    },

    neitherBuff() {
        let e = player.p.ethers.log(100).max(1).log(3).max(1).pow(2)
        return e
    },

    meteorBuff() {
        let e = player.p.ethers.log(10000).max(1).log(4).max(1).pow(3)
        return e
    },

    eternitiesBuff() {
        if (player.p.eternities.gte(1)) {
            let e = player.p.eternities.log(3).max(10).log(10).pow(1.5)
            return e
        } else {
            let e = d(1).div(player.p.eternities).log(10).pow(2)
            return d(1).div(e)
        }
    },

    eaterUnlocked() {
        return player.p.best_ethers.gte("5.4e54")
    },

    eaterGain() {
        let gain = d(1)
        
        if (getBuyableAmount("p", 21).gt(0)) {
            gain = gain.mul(buyableEffect("p", 21)[0])
        }
        if (getBuyableAmount("p", 22).gt(0)) {
            gain = gain.mul(buyableEffect("p", 22)[0])
        }
        if (getBuyableAmount("p", 23).gt(0)) {
            gain = gain.mul(buyableEffect("p", 23)[0])
        }
        return gain
    },

    eaterEffect() {
        let e = player.p.eater.div(10000)
        e = d(2).div(d(Math.E).pow(e).add(1)) 
        return e
    },

    etherParticle() {
        let ether_main = document.getElementById("ether-main")
        if (!ether_main) return

        let l = Math.random() * 70 + 30
        let cr = 30

        let color1 = tmp.p.eaterUnlocked ? [255, 121, 121] : [162, 155, 254]
        let color2 = tmp.p.eaterUnlocked ? [235, 77, 75] : [108, 92, 231]
        let c = [color1[0] + Math.random() * cr - 0.5*cr, color1[1] + Math.random() * cr - 0.5*cr, color1[2] + Math.random() * cr - 0.5*cr]
        let c2 = [color2[0] + Math.random() * cr - 0.5*cr, color2[1] + Math.random() * cr - 0.5*cr, color2[2] + Math.random() * cr - 0.5*cr]
        let opacity = Math.random() * 0.4 + 0.1
        let angle = Math.random() * 360
        let s1 = sin(angle)
        let s2 = cos(angle)

        let speed = (Math.random() * 1 + 0.5) * (4*s1*s1 + s2*s2) / 2

        let rect = ether_main.getBoundingClientRect()
        let x = rect.left + rect.width / 2
        let y = rect.top + rect.height / 2


        let particle = {
            image: "",
            style: {
                "height": `${l}px`, 
                "width": `${l}px`,
                "border-radius": `${l}px`,
                "border": "2px solid",
                "border-color": `rgba(${c2[0]},${c2[1]},${c2[2]},${opacity})`,
                "background-color": `rgba(${c[0]},${c[1]},${c[2]},${opacity})`
            },
            width: l,
            height: l,
            angle: angle,
            time: 5,
            fadeOutTime: 4,
            speed: speed,
            x: x + Math.random() * 100 - 50,
            y: y + Math.random() * 100 - 50
        }

        makeParticles(particle, 1)
    },

    update(diff) {
        player.p.best_meters = player.p.best_meters.max(player.p.meters)
        player.p.best_ethers = player.p.best_ethers.max(player.p.ethers)
        player.p.last_ether_particle += diff

        if (player.subtabs.p.mainTabs != "ether")
            clearParticles()

        if (player.p.last_ether_particle > 0.2) {
            this.etherParticle()
            player.p.last_ether_particle = 0
        }
        if (!player.s.paused) {
            player.p.time_cnt += diff
            let peter_gain = tmp.p.peterGain
            player.p.peters = player.p.peters.add(peter_gain.mul(diff))

            let js_gain = tmp.p.jsscriptGain
            player.p.jsscripts = player.p.jsscripts.add(js_gain.mul(diff))

            let tree_gain = tmp.p.treeGain
            player.p.typed_trees = player.p.typed_trees.add(tree_gain.mul(diff))


            if (player.p.cur_converting >= 0) {
                let ind = player.p.cur_converting
                let res = meter_res[ind]

                let end_amount = after_exp_gain(player.p.meters, 0.99, diff)
                let conv_amount = player.p.meters.sub(end_amount)

                player.p.meters = end_amount
                player.p[res] = player.p[res].add(conv_amount.mul(meter_res_ratio[ind]))
            }

            if (tmp.p.meterResUnlocked[0] >= 5) {
                player.p.meters = player.p.meters.add(tmp.p.meterGain.mul(diff).mul(0.1))
            }


            if (tmp.p.eternalUnlocked) {
                player.p.eternities = after_exp_gain(player.p.eternities, tmp.p.eternityGain, diff)
                    
                if (getBuyableAmount("p", 21).gt(0)) {
                    let divider = buyableEffect("p", 21)[1]
                    player.p.eternities = after_exp_gain(player.p.eternities, d(1).div(divider), diff)
                }

                if (player.p.eternities.lte("1e-11111")) {
                    player.p.eternities = d("1e-11111")
                }
                if (player.p.eternities.gte("1e11111")) {
                    player.p.eternities = d("1e11111")
                }
            }

            if (tmp.p.eaterUnlocked) {
                player.p.eater = player.p.eater.add(tmp.p.eaterGain.mul(diff))

                if (tmp.p.eaterEffect.lte(0.0001)) {
                    player.p.ethers = tmp.p.etherGain.mul(0.2)
                } else {
                    player.p.ethers = after_exp_gain(player.p.ethers, tmp.p.eaterEffect, diff)
                    player.p.ethers = player.p.ethers.add(tmp.p.etherGain.mul(diff))
                }
            } else {
                player.p.ethers = player.p.ethers.add(tmp.p.etherGain.mul(diff))
            }
        }
    },


    passiveGeneration() {
        if (player.s.paused) return undefined
        return (tmp.p.meterResUnlocked[0] >= 2) ? d(0.2) : undefined
    }
})




function secretStyle(x, y) {
    let dur = `${format(Math.random()*2 + 4)}s`
    let delay = `-${format(Math.random()*6)}s`

    return {
        position: "relative",
        left: x,
        top: y,    
        "animation": "secretFloat ease-in-out",
        "animation-duration": dur,
        "animation-delay": delay,
        "animation-iteration-count": "infinite",
    }
}

addLayer("s", {
    name: "secret",
    symbol: "S",
    position: 0,
    resource: () => wrap("secrets"),

    startData() { return {
        unlocked: true,
        paused: false,
		points: new Decimal(0),
        secret2_unlocked: false,
        secret3_unlocked: false,
        secret4_unlocked: false,
    }},
    color: "#000",
    textcolor: "#dfdfdf",
    style() {
        return  {
            "background-image": "radial-gradient(circle at center, #34495e, #95a5a6, #2c3e50)"
        }
    },
    type: "none",
    row: "side",
    layerShown: () => true,

    achievements: {
        11: {
            name: "sEcRET - FIND THIS PAGE",
            done() { return player.tab == "s" },
            onComplete() { player.s.points = player.s.points.add(1) },
            style: secretStyle("-160px", "0px"),
            tooltip: () => "Discover the existence of " + wrap("secret"),
            is_left_stroke: false,
            offset: [60, 60]
        },
        
        12: {
            name: () => hasAchievement("s", 12) ? `EasTERegg - MOD ID` : "LOCKED - MOD ID",
            done() { return player.s.secret2_unlocked },
            onComplete() { player.s.points = player.s.points.add(1) },
            style: secretStyle("140px", "50px"),
            is_left_stroke: true,
            offset: [-20, 50]
        },
        
        13: {
            name: () => hasAchievement("s", 13) ? "mETER - 4 OF 5 SQUARES" : "LOCKED - CLICK 4 OF 5 SQUARES",
            done() { return player.s.secret3_unlocked },
            onComplete() { player.s.points = player.s.points.add(1) },
            style: secretStyle("-120px", "260px"),
            is_left_stroke: false,
            offset: [30, -75]
        },

        14: {
            name: () => hasAchievement("s", 14) ? "pREsEnT - ASK A COG" : "LOCKED - ASK A COG",
            done() { return player.s.secret4_unlocked },
            onComplete() { player.s.points = player.s.points.add(1) },
            style: secretStyle("220px", "260px"),
            is_left_stroke: true,
            offset: [-30, -75]
        }
    },
    componentStyles: {
        achievement: {
            "background": "none",
            "border": "none",
            "transition-duration": "0.2s",
            "font-size": "12px",
            "width": "fit-content",
            "height": "fit-content",
            "padding": "10px"
        }
    },

    hotkeys: [
        {key: "w", description: "W: pause/resume the game", onPress(){player.s.paused = !player.s.paused}},
    ],

    tabFormat: [
        "main-display",
        ["display-text", () => `${wrap("secrets")} does nothing. They are just ${wrap("secrets")}.`],
        "blank",
        ["achievement", 11],
        ["achievement", 12],
        ["achievement", 13],
        ["achievement", 14],

    ]
})