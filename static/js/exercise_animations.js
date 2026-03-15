/**
 * ForgeFit - Exercise SVG Animations
 * Generates accurate stick-figure animations for every exercise.
 */

const ExerciseAnimations = (() => {
    // ── Colour palette (matches dark theme) ──
    const C = {
        body:  '#a5b4fc',   // indigo-300
        eq:    '#fbbf24',   // amber-400 (dumbbells)
        band:  '#06b6d4',   // cyan-500 (bands)
        bench: '#64748b',   // slate-500
        floor: '#475569',   // slate-600
        bg:    '#1e293b',   // slate-800
    };
    const W = 3;            // body stroke width
    const EW = 2.5;         // equipment stroke width

    // ── Tiny SVG helpers ──
    const open = `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" style="background:${C.bg};border-radius:8px">`;
    const close = '</svg>';
    const floor = `<line x1="10" y1="232" x2="190" y2="232" stroke="${C.floor}" stroke-width="2" stroke-linecap="round"/>`;
    const benchRect = (x,y,w,h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${C.bench}" opacity="0.7"/>`;
    const anim = (attr,vals,dur='2s') => `<animate attributeName="${attr}" values="${vals}" dur="${dur}" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1"/>`;
    const animLin = (attr,vals,dur='2s') => `<animate attributeName="${attr}" values="${vals}" dur="${dur}" repeatCount="indefinite"/>`;
    const head = (cx,cy,extra='') => `<circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="${C.body}" stroke-width="${W}">${extra}</circle>`;
    const line = (x1,y1,x2,y2,color=C.body,sw=W,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round">${extra}</line>`;
    const db = (cx,cy,extra='') => `<rect x="${cx-6}" y="${cy-3}" width="12" height="6" rx="2" fill="${C.eq}" opacity="0.9">${extra}</rect>`;
    const dbV = (cx,cy,extra='') => `<rect x="${cx-3}" y="${cy-6}" width="6" height="12" rx="2" fill="${C.eq}" opacity="0.9">${extra}</rect>`;
    const bandLine = (x1,y1,x2,y2,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.band}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 3">${extra}</line>`;

    // ── Label at bottom ──
    const label = (text) => `<text x="100" y="248" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="system-ui">${text}</text>`;

    // ────────────────────────────────────────
    // EXERCISE ANIMATION DEFINITIONS
    // ────────────────────────────────────────

    const animations = {};

    // ── CHEST ──

    animations['Dumbbell Bench Press'] = () => {
        // Person lying on bench pressing dumbbells up
        return open + floor +
            benchRect(40,140,120,14) +
            // Head (lying, facing up)
            head(55,133) +
            // Torso along bench
            line(67,133,140,133) +
            // Legs hanging off bench
            line(140,133,155,160) + line(155,160,155,195) +
            line(140,133,165,160) + line(165,160,165,195) +
            // Upper arms (perpendicular to torso, going up)
            line(80,133,80,110, C.body, W,
                anim('y2','110;110')) +
            line(120,133,120,110, C.body, W,
                anim('y2','110;110')) +
            // Forearms + dumbbells animate up/down
            line(80,110,80,80, C.body, W,
                anim('y1','110;110') + anim('y2','80;60;80')) +
            line(120,110,120,80, C.body, W,
                anim('y1','110;110') + anim('y2','80;60;80')) +
            // Dumbbells
            db(80,80, anim('y','77;57;77') + anim('x','74;74')) +
            db(120,80, anim('y','77;57;77') + anim('x','114;114')) +
            label('Dumbbell Bench Press') +
        close;
    };

    animations['Dumbbell Fly'] = () => {
        // Person lying on bench, arms arc out wide then back together
        return open + floor +
            benchRect(40,140,120,14) +
            head(55,133) +
            line(67,133,140,133) +
            line(140,133,155,160) + line(155,160,155,195) +
            line(140,133,165,160) + line(165,160,165,195) +
            // Arms arc out to sides (fly motion)
            line(85,133,60,90, C.body, W,
                anim('x2','60;40;60') + anim('y2','90;120;90')) +
            line(115,133,140,90, C.body, W,
                anim('x2','140;160;140') + anim('y2','90;120;90')) +
            // Dumbbells at hands
            db(60,90, anim('x','54;34;54') + anim('y','87;117;87')) +
            db(140,90, anim('x','134;154;134') + anim('y','87;117;87')) +
            label('Dumbbell Fly') +
        close;
    };

    animations['Incline Dumbbell Press'] = () => {
        // Person on inclined bench pressing
        return open + floor +
            // Incline bench (angled)
            `<line x1="50" y1="170" x2="90" y2="110" stroke="${C.bench}" stroke-width="12" stroke-linecap="round" opacity="0.7"/>` +
            `<line x1="90" y1="108" x2="130" y2="140" stroke="${C.bench}" stroke-width="8" stroke-linecap="round" opacity="0.5"/>` +
            // Head at top of incline
            head(75,85) +
            // Torso along incline
            line(80,97,105,155) +
            // Legs
            line(105,155,125,190) + line(105,155,140,190) +
            // Arms pressing up from incline angle
            line(85,110,65,80, C.body, W,
                anim('x2','65;60;65') + anim('y2','80;55;80')) +
            line(85,110,105,80, C.body, W,
                anim('x2','105;110;105') + anim('y2','80;55;80')) +
            db(65,80, anim('x','59;54;59') + anim('y','77;52;77')) +
            db(105,80, anim('x','99;104;99') + anim('y','77;52;77')) +
            label('Incline Dumbbell Press') +
        close;
    };

    animations['Push-Ups'] = () => {
        // Person in push-up position, body moving up and down
        return open + floor +
            // Hands on ground
            `<circle cx="55" cy="190" r="3" fill="${C.body}"/>` +
            `<circle cx="55" cy="200" r="3" fill="${C.body}"/>` +
            // Body as angled line (animated up/down)
            head(148,142, anim('cy','142;162;142')) +
            line(55,190,138,138, C.body, W,
                anim('y1','190;200;190') + anim('y2','138;158;138')) +
            // Arms (bend/straighten)
            line(55,190,55,170, C.body, W,
                anim('y1','190;200;190') + anim('y2','170;180;170')) +
            line(55,170,70,155, C.body, W,
                anim('y1','170;180;170') + anim('y2','155;170;155')) +
            // Legs
            line(138,138,160,190, C.body, W,
                anim('y1','138;158;138')) +
            line(138,138,170,190, C.body, W,
                anim('y1','138;158;138')) +
            // Torso line
            line(70,155,138,138, C.body, W,
                anim('y2','138;158;138') + anim('y1','155;170;155')) +
            label('Push-Ups') +
        close;
    };

    // ── BACK ──

    animations['Dumbbell Row'] = () => {
        // One knee on bench, pulling dumbbell up
        return open + floor +
            benchRect(30,165,100,10) +
            // Support hand + knee on bench
            head(90,115) +
            // Torso (flat, parallel to bench)
            line(90,127,140,127) +
            // Left arm on bench (support)
            line(100,127,85,165) +
            // Right leg on ground
            line(140,127,155,165) + line(155,165,155,200) +
            // Left knee on bench
            line(140,127,130,165) +
            // Rowing arm (animated)
            line(115,127,115,165, C.body, W,
                anim('y2','165;127;165')) +
            // Dumbbell
            dbV(115,165, anim('y','159;121;159')) +
            label('Dumbbell Row') +
        close;
    };

    animations['Bent Over Dumbbell Row'] = () => {
        // Standing hinged forward, pulling two dumbbells
        return open + floor +
            head(70,95) +
            // Torso bent forward
            line(75,107,120,140) +
            // Legs
            line(120,140,110,195) + line(120,140,135,195) +
            // Arms pulling dumbbells
            line(85,115,85,160, C.body, W,
                anim('y2','160;120;160')) +
            line(105,125,105,170, C.body, W,
                anim('y2','170;130;170')) +
            dbV(85,160, anim('y','154;114;154')) +
            dbV(105,170, anim('y','164;124;164')) +
            label('Bent Over Dumbbell Row') +
        close;
    };

    animations['Band Pull-Apart'] = () => {
        // Standing, pulling band apart at shoulder height
        return open + floor +
            head(100,40) +
            line(100,52,100,120) +
            line(100,120,90,180) + line(90,180,90,215) +
            line(100,120,110,180) + line(110,180,110,215) +
            // Arms at shoulder height, spreading apart
            line(100,65,70,65, C.body, W,
                anim('x2','70;35;70')) +
            line(100,65,130,65, C.body, W,
                anim('x2','130;165;130')) +
            // Band between hands
            bandLine(70,65,130,65,
                anim('x1','70;35;70') + anim('x2','130;165;130')) +
            label('Band Pull-Apart') +
        close;
    };

    animations['Band Lat Pulldown'] = () => {
        // Kneeling, pulling band down from above
        return open +
            // Door anchor at top
            `<rect x="95" y="5" width="10" height="15" fill="${C.bench}" rx="2"/>` +
            // Band from anchor to hands
            bandLine(100,20,65,80,
                anim('x2','65;65') + anim('y2','80;140;80')) +
            bandLine(100,20,135,80,
                anim('x2','135;135') + anim('y2','80;140;80')) +
            head(100,55) +
            line(100,67,100,140) +
            // Kneeling legs
            line(100,140,85,170) + line(85,170,85,200) +
            line(100,140,115,170) + line(115,170,115,200) +
            // Arms pulling down
            line(100,75,65,80, C.body, W,
                anim('y2','80;140;80')) +
            line(100,75,135,80, C.body, W,
                anim('y2','80;140;80')) +
            floor + label('Band Lat Pulldown') +
        close;
    };

    animations['Reverse Fly'] = () => {
        // Bent over, arms raising out to sides
        return open + floor +
            head(70,90) +
            line(75,102,120,135) +
            line(120,135,110,195) + line(120,135,135,195) +
            // Arms raising out to sides
            line(88,112,75,145, C.body, W,
                anim('x2','75;45;75') + anim('y2','145;95;145')) +
            line(100,120,115,155, C.body, W,
                anim('x2','115;150;115') + anim('y2','155;105;155')) +
            // Dumbbells
            dbV(75,145, anim('x','72;42;72') + anim('y','139;89;139')) +
            dbV(115,155, anim('x','112;147;112') + anim('y','149;99;149')) +
            label('Reverse Fly') +
        close;
    };

    // ── SHOULDERS ──

    animations['Dumbbell Shoulder Press'] = () => {
        // Standing, pressing dumbbells overhead
        return open + floor +
            head(100,50, anim('cy','50;42;50')) +
            line(100,62,100,130, C.body, W, anim('y1','62;54;62')) +
            line(100,130,90,185) + line(90,185,90,215) +
            line(100,130,110,185) + line(110,185,110,215) +
            // Arms pressing up
            line(100,72,70,72, C.body, W,
                anim('y1','72;64;72') + anim('y2','72;64;72')) +
            line(70,72,65,105, C.body, W,
                anim('y1','72;64;72') + anim('y2','105;40;105')) +
            line(100,72,130,72, C.body, W,
                anim('y1','72;64;72') + anim('y2','72;64;72')) +
            line(130,72,135,105, C.body, W,
                anim('y1','72;64;72') + anim('y2','105;40;105')) +
            db(65,105, anim('y','102;37;102')) +
            db(135,105, anim('y','102;37;102')) +
            label('Dumbbell Shoulder Press') +
        close;
    };

    animations['Lateral Raise'] = () => {
        // Standing, arms raising to sides
        return open + floor +
            head(100,45) +
            line(100,57,100,125) +
            line(100,125,90,185) + line(90,185,90,215) +
            line(100,125,110,185) + line(110,185,110,215) +
            // Arms raising to T-position
            line(100,70,75,70, C.body, W,
                anim('y2','70;70')) +
            line(75,70,75,105, C.body, W,
                anim('x1','75;45;75') + anim('y1','70;70') +
                anim('x2','75;45;75') + anim('y2','105;70;105')) +
            line(100,70,125,70, C.body, W,
                anim('y2','70;70')) +
            line(125,70,125,105, C.body, W,
                anim('x1','125;155;125') + anim('y1','70;70') +
                anim('x2','125;155;125') + anim('y2','105;70;105')) +
            dbV(75,105, anim('x','72;42;72') + anim('y','99;64;99')) +
            dbV(125,105, anim('x','122;152;122') + anim('y','99;64;99')) +
            label('Lateral Raise') +
        close;
    };

    animations['Front Raise'] = () => {
        // Standing, arms raising to front
        return open + floor +
            head(100,45) +
            line(100,57,100,125) +
            line(100,125,90,185) + line(90,185,90,215) +
            line(100,125,110,185) + line(110,185,110,215) +
            // Arms raising forward
            line(100,70,90,70, C.body, W) +
            line(90,70,85,105, C.body, W,
                anim('x2','85;75;85') + anim('y2','105;55;105')) +
            line(100,70,110,70, C.body, W) +
            line(110,70,115,105, C.body, W,
                anim('x2','115;105;115') + anim('y2','105;55;105')) +
            dbV(85,105, anim('x','82;72;82') + anim('y','99;49;99')) +
            dbV(115,105, anim('x','112;102;112') + anim('y','99;49;99')) +
            label('Front Raise') +
        close;
    };

    // ── ARMS ──

    animations['Dumbbell Bicep Curl'] = () => {
        // Standing, curling dumbbells up
        return open + floor +
            head(100,40) +
            line(100,52,100,120) +
            line(100,120,90,180) + line(90,180,90,215) +
            line(100,120,110,180) + line(110,180,110,215) +
            // Upper arms pinned at sides
            line(100,65,80,65) + line(80,65,80,95) +
            line(100,65,120,65) + line(120,65,120,95) +
            // Forearms curling up
            line(80,95,80,130, C.body, W,
                anim('y2','130;75;130')) +
            line(120,95,120,130, C.body, W,
                anim('y2','130;75;130')) +
            // Dumbbells
            db(80,130, anim('y','127;72;127')) +
            db(120,130, anim('y','127;72;127')) +
            label('Dumbbell Bicep Curl') +
        close;
    };

    animations['Hammer Curl'] = () => {
        // Same as bicep curl but dumbbells vertical (neutral grip)
        return open + floor +
            head(100,40) +
            line(100,52,100,120) +
            line(100,120,90,180) + line(90,180,90,215) +
            line(100,120,110,180) + line(110,180,110,215) +
            line(100,65,80,65) + line(80,65,80,95) +
            line(100,65,120,65) + line(120,65,120,95) +
            line(80,95,80,130, C.body, W,
                anim('y2','130;75;130')) +
            line(120,95,120,130, C.body, W,
                anim('y2','130;75;130')) +
            // Vertical dumbbells (hammer grip)
            dbV(80,130, anim('y','124;69;124')) +
            dbV(120,130, anim('y','124;69;124')) +
            label('Hammer Curl') +
        close;
    };

    animations['Tricep Overhead Extension'] = () => {
        // Standing, single dumbbell overhead, lowering behind head
        return open + floor +
            head(100,55) +
            line(100,67,100,135) +
            line(100,135,90,190) + line(90,190,90,220) +
            line(100,135,110,190) + line(110,190,110,220) +
            // Both arms go up, elbows point to ceiling
            line(100,80,90,55) + line(100,80,110,55) +
            // Forearms go behind head
            line(90,55,100,35, C.body, W,
                anim('y2','35;75;35')) +
            line(110,55,100,35, C.body, W,
                anim('y2','35;75;35')) +
            // Dumbbell
            db(100,35, anim('y','32;72;32')) +
            label('Tricep Overhead Extension') +
        close;
    };

    animations['Tricep Kickback'] = () => {
        // Bent over, extending arm straight back
        return open + floor +
            benchRect(25,165,80,10) +
            head(75,110) +
            line(80,122,130,145) +
            // Left arm on bench
            line(90,128,70,165) +
            // Legs
            line(130,145,125,195) + line(130,145,145,195) +
            // Working arm: upper arm parallel to torso
            line(105,132,120,120) +
            // Forearm kicks back (animated)
            line(120,120,120,150, C.body, W,
                anim('x2','120;150;120') + anim('y2','150;120;150')) +
            dbV(120,150, anim('x','117;147;117') + anim('y','144;114;144')) +
            label('Tricep Kickback') +
        close;
    };

    animations['Band Bicep Curl'] = () => {
        // Standing on band, curling handles up
        return open + floor +
            head(100,40) +
            line(100,52,100,120) +
            line(100,120,90,180) + line(90,180,90,215) +
            line(100,120,110,180) + line(110,180,110,215) +
            // Band under feet to hands
            bandLine(90,215,80,130,
                anim('y2','130;75;130')) +
            bandLine(110,215,120,130,
                anim('y2','130;75;130')) +
            // Upper arms
            line(100,65,80,65) + line(80,65,80,95) +
            line(100,65,120,65) + line(120,65,120,95) +
            // Forearms
            line(80,95,80,130, C.body, W,
                anim('y2','130;75;130')) +
            line(120,95,120,130, C.body, W,
                anim('y2','130;75;130')) +
            label('Band Bicep Curl') +
        close;
    };

    // ── LEGS ──

    animations['Goblet Squat'] = () => {
        // Standing then squatting, holding dumbbell at chest
        return open + floor +
            head(100,40, anim('cy','40;65;40')) +
            // Torso
            line(100,52,100,120, C.body, W,
                anim('y1','52;77;52') + anim('y2','120;145;120')) +
            // Legs squatting
            line(100,120,80,170, C.body, W,
                anim('y1','120;145;120') + anim('x2','80;65;80') + anim('y2','170;175;170')) +
            line(80,170,80,215, C.body, W,
                anim('x1','80;65;80') + anim('y1','170;175;170') + anim('x2','80;75;80')) +
            line(100,120,120,170, C.body, W,
                anim('y1','120;145;120') + anim('x2','120;135;120') + anim('y2','170;175;170')) +
            line(120,170,120,215, C.body, W,
                anim('x1','120;135;120') + anim('y1','170;175;170') + anim('x2','120;125;120')) +
            // Arms holding dumbbell at chest
            line(100,65,90,80, C.body, W,
                anim('y1','65;90;65') + anim('y2','80;105;80')) +
            line(100,65,110,80, C.body, W,
                anim('y1','65;90;65') + anim('y2','80;105;80')) +
            dbV(100,82, anim('y','76;101;76')) +
            label('Goblet Squat') +
        close;
    };

    animations['Dumbbell Romanian Deadlift'] = () => {
        // Standing, hinging forward with dumbbells
        return open + floor +
            head(100,40, anim('cy','40;85;40')) +
            // Torso hinging
            line(100,52,100,120, C.body, W,
                anim('y1','52;90;52') + anim('x1','100;75;100') +
                anim('x2','100;115;100') + anim('y2','120;140;120')) +
            // Legs (slight knee bend)
            line(100,120,90,175, C.body, W,
                anim('y1','120;140;120')) +
            line(90,175,90,215) +
            line(100,120,110,175, C.body, W,
                anim('y1','120;140;120')) +
            line(110,175,110,215) +
            // Arms hanging with dumbbells
            line(100,65,90,100, C.body, W,
                anim('x1','100;82;100') + anim('y1','65;100;65') +
                anim('x2','90;82;90') + anim('y2','100;160;100')) +
            line(100,65,110,100, C.body, W,
                anim('x1','100;92;100') + anim('y1','65;100;65') +
                anim('x2','110;92;110') + anim('y2','100;160;100')) +
            dbV(90,100, anim('x','87;79;87') + anim('y','94;154;94')) +
            dbV(110,100, anim('x','107;89;107') + anim('y','94;154;94')) +
            label('Dumbbell Romanian Deadlift') +
        close;
    };

    animations['Dumbbell Lunge'] = () => {
        // Stepping forward into lunge, both knees bending
        return open + floor +
            head(100,40, anim('cy','40;65;40')) +
            line(100,52,100,120, C.body, W,
                anim('y1','52;77;52') + anim('y2','120;145;120')) +
            // Front leg stepping forward and bending
            line(100,120,120,170, C.body, W,
                anim('y1','120;145;120') + anim('x2','120;135;120') + anim('y2','170;180;170')) +
            line(120,170,120,215, C.body, W,
                anim('x1','120;135;120') + anim('y1','170;180;170') + anim('x2','120;135;120')) +
            // Back leg
            line(100,120,80,170, C.body, W,
                anim('y1','120;145;120') + anim('x2','80;70;80') + anim('y2','170;195;170')) +
            line(80,170,80,215, C.body, W,
                anim('x1','80;70;80') + anim('y1','170;195;170') + anim('x2','80;80;80') + anim('y2','215;215;215')) +
            // Arms with dumbbells at sides
            line(100,65,85,105, C.body, W, anim('y1','65;90;65') + anim('y2','105;130;105')) +
            line(100,65,115,105, C.body, W, anim('y1','65;90;65') + anim('y2','105;130;105')) +
            dbV(85,105, anim('y','99;124;99')) +
            dbV(115,105, anim('y','99;124;99')) +
            label('Dumbbell Lunge') +
        close;
    };

    animations['Bulgarian Split Squat'] = () => {
        // Rear foot elevated on bench, squatting down
        return open + floor +
            benchRect(130,175,50,10) +
            head(90,40, anim('cy','40;70;40')) +
            line(90,52,90,120, C.body, W,
                anim('y1','52;82;52') + anim('y2','120;145;120')) +
            // Front leg
            line(90,120,80,170, C.body, W,
                anim('y1','120;145;120') + anim('y2','170;180;170')) +
            line(80,170,80,215, C.body, W,
                anim('y1','170;180;170')) +
            // Rear leg on bench
            line(90,120,120,150, C.body, W,
                anim('y1','120;145;120') + anim('y2','150;170;150')) +
            line(120,150,145,175, C.body, W,
                anim('y1','150;170;150')) +
            // Arms with dumbbells
            line(90,65,75,100, C.body, W, anim('y1','65;95;65') + anim('y2','100;130;100')) +
            line(90,65,105,100, C.body, W, anim('y1','65;95;65') + anim('y2','100;130;100')) +
            dbV(75,100, anim('y','94;124;94')) +
            dbV(105,100, anim('y','94;124;94')) +
            label('Bulgarian Split Squat') +
        close;
    };

    animations['Dumbbell Step-Up'] = () => {
        // Stepping up onto bench
        return open + floor +
            benchRect(70,175,60,16) +
            head(100,50, anim('cy','50;25;50')) +
            line(100,62,100,130, C.body, W,
                anim('y1','62;37;62') + anim('y2','130;105;130')) +
            // Stepping leg (goes up onto bench)
            line(100,130,100,175, C.body, W,
                anim('y1','130;105;130') + anim('y2','175;155;175')) +
            line(100,175,100,215, C.body, W,
                anim('y1','175;155;175') + anim('y2','215;175;215')) +
            // Trailing leg
            line(100,130,115,175, C.body, W,
                anim('y1','130;105;130')) +
            line(115,175,115,215) +
            // Arms with dumbbells
            line(100,75,85,115, C.body, W, anim('y1','75;50;75') + anim('y2','115;90;115')) +
            line(100,75,115,115, C.body, W, anim('y1','75;50;75') + anim('y2','115;90;115')) +
            dbV(85,115, anim('y','109;84;109')) +
            dbV(115,115, anim('y','109;84;109')) +
            label('Dumbbell Step-Up') +
        close;
    };

    animations['Dumbbell Calf Raise'] = () => {
        // Standing, rising onto toes
        return open + floor +
            head(100,35, anim('cy','35;22;35')) +
            line(100,47,100,115, C.body, W,
                anim('y1','47;34;47') + anim('y2','115;102;115')) +
            line(100,115,90,175, C.body, W,
                anim('y1','115;102;115') + anim('y2','175;162;175')) +
            line(90,175,90,215, C.body, W,
                anim('y1','175;162;175') + anim('y2','215;202;215')) +
            line(100,115,110,175, C.body, W,
                anim('y1','115;102;115') + anim('y2','175;162;175')) +
            line(110,175,110,215, C.body, W,
                anim('y1','175;162;175') + anim('y2','215;202;215')) +
            // Arms at sides with dumbbells
            line(100,60,85,100, C.body, W, anim('y1','60;47;60') + anim('y2','100;87;100')) +
            line(100,60,115,100, C.body, W, anim('y1','60;47;60') + anim('y2','100;87;100')) +
            dbV(85,100, anim('y','94;81;94')) +
            dbV(115,100, anim('y','94;81;94')) +
            label('Dumbbell Calf Raise') +
        close;
    };

    // ── CORE ──

    animations['Plank'] = () => {
        // Forearm plank with slight breathing motion
        return open + floor +
            head(45,155, anim('cy','155;153;155')) +
            // Forearms on ground
            line(40,185,55,170, C.body, W) +
            line(40,195,55,170, C.body, W) +
            // Torso plank line
            line(55,165,150,155, C.body, W,
                anim('y2','155;152;155')) +
            // Legs
            line(150,155,175,195, C.body, W,
                anim('y1','155;152;155')) +
            line(150,155,180,195, C.body, W,
                anim('y1','155;152;155')) +
            label('Plank') +
        close;
    };

    animations['Dead Bug'] = () => {
        // Lying on back, opposite arm and leg extending
        return open + floor +
            // Lying on back (floor at y=195)
            head(50,190) +
            line(62,190,140,190) +
            // Left arm extending overhead (animated)
            line(75,190,55,165, C.body, W,
                anim('x2','55;35;55') + anim('y2','165;170;165')) +
            // Right arm stays up
            line(75,190,75,160, C.body, W,
                anim('y2','160;145;160')) +
            // Left leg stays bent
            line(140,190,130,165) + line(130,165,145,150) +
            // Right leg extends (animated)
            line(140,190,155,165, C.body, W,
                anim('x2','155;175;155') + anim('y2','165;180;165')) +
            line(155,165,155,145, C.body, W,
                anim('x1','155;175;155') + anim('y1','165;180;165') +
                anim('x2','155;185;155') + anim('y2','145;180;145')) +
            label('Dead Bug') +
        close;
    };

    animations['Bird Dog'] = () => {
        // On all fours, extending opposite arm and leg
        return open + floor +
            head(65,130, anim('cy','130;120;130')) +
            // Torso (horizontal)
            line(70,140,130,140) +
            // Left arm (support, on ground)
            line(85,140,75,190) +
            // Right arm extends forward (animated)
            line(85,140,80,175, C.body, W,
                anim('x2','80;50;80') + anim('y2','175;125;175')) +
            // Right leg (support, on ground)
            line(130,140,140,175) + line(140,175,140,195) +
            // Left leg extends back (animated)
            line(130,140,145,175, C.body, W,
                anim('x2','145;175;145') + anim('y2','175;130;175')) +
            label('Bird Dog') +
        close;
    };

    animations['Russian Twist'] = () => {
        // Seated, leaning back, rotating torso side to side
        return open + floor +
            head(100,60, anim('cx','100;80;100;120;100')) +
            // Torso leaning back
            line(100,72,100,130, C.body, W,
                anim('x1','100;80;100;120;100')) +
            // Legs on ground, knees bent
            line(100,130,80,160) + line(80,160,90,195) +
            line(100,130,120,160) + line(120,160,110,195) +
            // Arms holding dumbbell, rotating
            line(100,90,85,110, C.body, W,
                anim('x1','100;75;100;125;100') + anim('x2','85;55;85;115;85')) +
            line(100,90,115,110, C.body, W,
                anim('x1','100;75;100;125;100') + anim('x2','115;85;115;145;115')) +
            dbV(100,112, anim('x','97;67;97;127;97')) +
            label('Russian Twist') +
        close;
    };

    animations['Dumbbell Side Bend'] = () => {
        // Standing, bending to one side
        return open + floor +
            head(100,35, anim('cx','100;85;100')) +
            line(100,47,100,120, C.body, W,
                anim('x1','100;85;100') + anim('x2','100;90;100')) +
            line(100,120,90,185) + line(90,185,90,215) +
            line(100,120,110,185) + line(110,185,110,215) +
            // Right arm with dumbbell, bending to right
            line(100,60,115,100, C.body, W,
                anim('x1','100;85;100') + anim('x2','115;100;115') + anim('y2','100;115;100')) +
            dbV(115,100, anim('x','112;97;112') + anim('y','94;109;94')) +
            // Left arm resting behind head
            line(100,60,85,50, C.body, W,
                anim('x1','100;85;100') + anim('x2','85;70;85')) +
            label('Dumbbell Side Bend') +
        close;
    };

    // ── MOBILITY / FLEXIBILITY ──

    animations['Cat-Cow Stretch'] = () => {
        // On all fours, back arching up (cat) then dipping down (cow)
        return open + floor +
            head(55,130, anim('cy','130;120;130;140;130')) +
            // Torso - arches up then dips down
            `<path d="M 65 140 Q 100 140 135 140" fill="none" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="d" values="M 65 140 Q 100 140 135 140;M 65 140 Q 100 120 135 140;M 65 140 Q 100 140 135 140;M 65 140 Q 100 160 135 140;M 65 140 Q 100 140 135 140" dur="3s" repeatCount="indefinite"/>
            </path>` +
            // Front arms on ground
            line(75,140,65,190) + line(75,140,80,190) +
            // Back legs on ground
            line(125,140,120,190) + line(125,140,140,190) +
            label('Cat-Cow Stretch') +
        close;
    };

    animations['Hip Flexor Stretch'] = () => {
        // Kneeling lunge position, pushing hips forward
        return open + floor +
            head(100,50, anim('cy','50;45;50')) +
            line(100,62,100,130, C.body, W,
                anim('y1','62;57;62')) +
            // Front leg at 90 degrees
            line(100,130,130,165) + line(130,165,130,215) +
            // Back leg kneeling
            line(100,130,80,170) + line(80,170,70,215) +
            // Back knee on ground
            `<circle cx="80" cy="170" r="3" fill="${C.body}"/>` +
            // Arms on front knee
            line(100,75,120,100, C.body, W, anim('y1','75;70;75')) +
            // Hip push forward indicator
            `<path d="M 95 130 L 85 125" fill="none" stroke="${C.band}" stroke-width="1.5" opacity="0.6">
                <animate attributeName="d" values="M 95 130 L 85 125;M 100 130 L 90 125;M 95 130 L 85 125" dur="2s" repeatCount="indefinite"/>
            </path>` +
            label('Hip Flexor Stretch') +
        close;
    };

    animations['Pigeon Pose'] = () => {
        // Seated with one leg folded in front, other extended behind
        return open + floor +
            head(90,70, anim('cy','70;65;70')) +
            // Torso leaning forward
            line(90,82,95,140, C.body, W,
                anim('y1','82;77;82')) +
            // Front leg folded sideways on ground
            line(95,140,70,160) + line(70,160,110,170) +
            // Back leg extended straight behind
            line(95,140,160,155) + line(160,155,180,165) +
            // Arms resting forward on ground
            line(90,95,70,145, C.body, W, anim('y1','95;90;95')) +
            line(90,95,85,145, C.body, W, anim('y1','95;90;95')) +
            floor + label('Pigeon Pose') +
        close;
    };

    animations["World's Greatest Stretch"] = () => {
        // Deep lunge with rotation - one hand on ground, other reaching to ceiling
        return open + floor +
            head(80,65, anim('cy','65;60;65')) +
            line(80,77,100,140, C.body, W,
                anim('y1','77;72;77')) +
            // Front leg in deep lunge
            line(100,140,115,175) + line(115,175,115,215) +
            // Back leg extended
            line(100,140,60,175) + line(60,175,45,215) +
            // One hand on ground
            line(90,100,105,175, C.body, W) +
            // Other arm rotating to ceiling
            line(90,100,65,60, C.body, W,
                anim('x2','65;55;65') + anim('y2','60;40;60')) +
            label("World's Greatest Stretch") +
        close;
    };

    animations['Thoracic Spine Rotation'] = () => {
        // Lying on side, top arm rotating open
        return open + floor +
            // Person lying on side
            head(50,150) +
            line(62,150,130,150) +
            // Legs stacked, knees bent
            line(130,150,115,175) + line(115,175,90,185) +
            line(130,150,115,180) + line(115,180,90,190) +
            // Bottom arm extended in front
            line(80,150,55,130) +
            // Top arm rotating open (animated)
            line(80,150,55,130, C.body, W,
                anim('x2','55;55;105;55') + anim('y2','130;130;80;130')) +
            // Rotation arc indicator
            `<path d="M 55 130 Q 60 100 80 80" fill="none" stroke="${C.band}" stroke-width="1" opacity="0.4" stroke-dasharray="3 3">
                <animate attributeName="opacity" values="0;0;0.6;0" dur="3s" repeatCount="indefinite"/>
            </path>` +
            label('Thoracic Spine Rotation') +
        close;
    };

    animations['Figure Four Stretch'] = () => {
        // Lying on back, ankle crossed over opposite knee, pulling toward chest
        return open + floor +
            head(40,190) +
            line(52,190,130,190) +
            // Bottom leg - knee bent, pulling toward chest
            line(130,190,140,160, C.body, W,
                anim('x2','140;130;140') + anim('y2','160;150;160')) +
            line(140,160,155,175, C.body, W,
                anim('x1','140;130;140') + anim('y1','160;150;160')) +
            // Top leg - ankle crossed over knee
            line(130,190,150,165) +
            line(150,165,140,150, C.body, W,
                anim('x1','150;140;150') + anim('y1','165;155;165')) +
            // Arms pulling leg in
            line(80,190,140,165, C.body, W,
                anim('y2','165;155;165')) +
            line(100,190,145,170, C.body, W,
                anim('y2','170;160;170')) +
            label('Figure Four Stretch') +
        close;
    };

    animations["Child's Pose"] = () => {
        // Kneeling with arms extended forward, forehead on ground
        return open + floor +
            // Knees on ground
            `<circle cx="140" cy="185" r="3" fill="${C.body}"/>` +
            // Hips sitting back on heels
            line(140,185,130,165) +
            // Torso folded forward
            line(130,165,70,180, C.body, W,
                anim('y2','180;175;180')) +
            // Head resting on ground
            head(60,175, anim('cy','175;170;175')) +
            // Arms extended forward on ground
            line(80,175,30,175, C.body, W) +
            line(80,178,30,178, C.body, W) +
            // Feet
            line(140,185,155,195) +
            label("Child's Pose") +
        close;
    };

    animations['Band Shoulder Dislocate'] = () => {
        // Standing, band going overhead from front to behind
        return open + floor +
            head(100,55) +
            line(100,67,100,135) +
            line(100,135,90,190) + line(90,190,90,220) +
            line(100,135,110,190) + line(110,190,110,220) +
            // Arms holding band wide, rotating overhead
            // Left arm
            line(100,80,60,95, C.body, W,
                anim('x2','60;55;45;55;60') + anim('y2','95;55;80;115;95')) +
            // Right arm
            line(100,80,140,95, C.body, W,
                anim('x2','140;145;155;145;140') + anim('y2','95;55;80;115;95')) +
            // Band between hands
            bandLine(60,95,140,95,
                anim('x1','60;55;45;55;60') + anim('y1','95;55;80;115;95') +
                anim('x2','140;145;155;145;140') + anim('y2','95;55;80;115;95')) +
            label('Band Shoulder Dislocate') +
        close;
    };

    animations['90/90 Hip Stretch'] = () => {
        // Seated, one leg 90 degrees in front, one behind
        return open + floor +
            head(100,55, anim('cy','55;50;55')) +
            // Torso upright then leaning forward
            line(100,67,100,130, C.body, W,
                anim('y1','67;62;67') + anim('x2','100;95;100') + anim('y2','130;130;130')) +
            // Front leg: 90-degree angle
            line(100,130,130,140) + line(130,140,130,175) +
            // Back leg: 90-degree angle behind
            line(100,130,70,140) + line(70,140,70,175) +
            // Arms relaxed on front knee
            line(100,85,120,110, C.body, W, anim('y1','85;80;85')) +
            line(100,85,80,110, C.body, W, anim('y1','85;80;85')) +
            label('90/90 Hip Stretch') +
        close;
    };

    animations['Standing Hamstring Stretch'] = () => {
        // Standing with one foot on raised surface, hinging forward
        return open + floor +
            // Small platform
            benchRect(100,190,50,8) +
            head(90,55, anim('cy','55;75;55')) +
            line(90,67,95,130, C.body, W,
                anim('x1','90;85;90') + anim('y1','67;87;67')) +
            // Standing leg
            line(95,130,85,180) + line(85,180,85,215) +
            // Extended leg on platform
            line(95,130,130,185) +
            // Arms reaching forward
            line(90,85,110,110, C.body, W,
                anim('x1','90;85;90') + anim('y1','85;95;85') +
                anim('x2','110;125;110') + anim('y2','110;135;110')) +
            label('Standing Hamstring Stretch') +
        close;
    };

    // ── CARDIO ──

    animations['Jumping Jacks'] = () => {
        // Arms and legs spreading apart then together
        return open + floor +
            head(100,35, anim('cy','35;28;35')) +
            line(100,47,100,115, C.body, W,
                anim('y1','47;40;47') + anim('y2','115;108;115')) +
            // Legs spread apart then together
            line(100,115,90,170, C.body, W,
                anim('x2','90;65;90') + anim('y1','115;108;115')) +
            line(90,170,90,215, C.body, W,
                anim('x1','90;65;90') + anim('x2','90;65;90')) +
            line(100,115,110,170, C.body, W,
                anim('x2','110;135;110') + anim('y1','115;108;115')) +
            line(110,170,110,215, C.body, W,
                anim('x1','110;135;110') + anim('x2','110;135;110')) +
            // Arms going up and down
            line(100,60,80,80, C.body, W,
                anim('x2','80;50;80') + anim('y2','80;30;80') + anim('y1','60;53;60')) +
            line(100,60,120,80, C.body, W,
                anim('x2','120;150;120') + anim('y2','80;30;80') + anim('y1','60;53;60')) +
            label('Jumping Jacks') +
        close;
    };

    animations['Mountain Climbers'] = () => {
        // Push-up position, alternating driving knees forward
        return open + floor +
            head(50,148) +
            // Torso
            line(58,155,145,155) +
            // Arms (stationary, supporting)
            line(65,155,45,195) + line(65,155,55,195) +
            // Left leg (drives forward then back)
            line(140,155,120,180, C.body, W,
                anim('x2','120;90;120') + anim('y2','180;170;180')) +
            line(120,180,130,210, C.body, W,
                anim('x1','120;90;120') + anim('y1','180;170;180') +
                anim('x2','130;95;130') + anim('y2','210;195;210')) +
            // Right leg (opposite timing)
            line(140,155,160,180, C.body, W,
                anim('x2','160;130;160') + anim('y2','180;170;180')) +
            line(160,180,170,210, C.body, W,
                anim('x1','160;130;160') + anim('y1','180;170;180') +
                anim('x2','170;135;170') + anim('y2','210;195;210')) +
            label('Mountain Climbers') +
        close;
    };

    animations['High Knees'] = () => {
        // Running in place with high knee drive
        return open + floor +
            head(100,30, anim('cy','30;25;30;25;30')) +
            line(100,42,100,110, C.body, W,
                anim('y1','42;37;42;37;42') + anim('y2','110;105;110;105;110')) +
            // Left leg: high then down
            line(100,110,85,140, C.body, W,
                anim('x2','85;80;85') + anim('y2','140;100;140')) +
            line(85,140,85,200, C.body, W,
                anim('x1','85;80;85') + anim('y1','140;100;140') +
                anim('y2','200;130;200')) +
            // Right leg: opposite timing
            line(100,110,115,140, C.body, W,
                anim('x2','115;120;115') + anim('y2','140;200;140')) +
            line(115,140,115,200, C.body, W,
                anim('x1','115;120;115') + anim('y1','140;200;140') +
                anim('y2','200;200;200')) +
            // Arms pumping
            line(100,55,80,75, C.body, W,
                anim('x2','80;75;80') + anim('y2','75;55;75')) +
            line(100,55,120,75, C.body, W,
                anim('x2','120;125;120') + anim('y2','75;90;75')) +
            label('High Knees') +
        close;
    };

    animations['Burpees'] = () => {
        // Multi-phase: stand → squat → plank → squat → jump
        // Simplified: show the jump phase and plank phase alternating
        return open + floor +
            // Phase animation: standing/jumping then plank
            head(100,25,
                `<animate attributeName="cx" values="100;100;60;100" dur="3s" repeatCount="indefinite"/>` +
                `<animate attributeName="cy" values="25;45;155;25" dur="3s" repeatCount="indefinite"/>`) +
            // Torso
            `<line x1="100" y1="37" x2="100" y2="105" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="100;100;65;100" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="y1" values="37;57;160;37" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="100;100;145;100" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="y2" values="105;130;160;105" dur="3s" repeatCount="indefinite"/>
            </line>` +
            // Left leg
            `<line x1="100" y1="105" x2="90" y2="170" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="100;100;140;100" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="y1" values="105;130;160;105" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="90;80;160;90" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="y2" values="170;195;195;170" dur="3s" repeatCount="indefinite"/>
            </line>` +
            // Right leg
            `<line x1="100" y1="105" x2="110" y2="170" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="100;100;140;100" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="y1" values="105;130;160;105" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="110;120;170;110" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="y2" values="170;195;195;170" dur="3s" repeatCount="indefinite"/>
            </line>` +
            // Arms (overhead during jump, on ground during plank)
            `<line x1="100" y1="55" x2="75" y2="30" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="100;100;65;100" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="y1" values="55;75;160;55" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="75;85;50;75" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="y2" values="30;85;195;30" dur="3s" repeatCount="indefinite"/>
            </line>` +
            `<line x1="100" y1="55" x2="125" y2="30" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="100;100;65;100" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="y1" values="55;75;160;55" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="125;115;55;125" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="y2" values="30;85;195;30" dur="3s" repeatCount="indefinite"/>
            </line>` +
            label('Burpees') +
        close;
    };

    animations['Band Squat Jumps'] = () => {
        // Squat jumps with band resistance
        return open + floor +
            head(100,30, anim('cy','30;60;30')) +
            line(100,42,100,110, C.body, W,
                anim('y1','42;72;42') + anim('y2','110;140;110')) +
            // Legs (spread on squat, together on jump)
            line(100,110,80,165, C.body, W,
                anim('y1','110;140;110') + anim('x2','80;65;80') + anim('y2','165;175;165')) +
            line(80,165,80,215, C.body, W,
                anim('x1','80;65;80') + anim('y1','165;175;165') + anim('x2','80;70;80') + anim('y2','215;195;215')) +
            line(100,110,120,165, C.body, W,
                anim('y1','110;140;110') + anim('x2','120;135;120') + anim('y2','165;175;165')) +
            line(120,165,120,215, C.body, W,
                anim('x1','120;135;120') + anim('y1','165;175;175') + anim('x2','120;130;120') + anim('y2','215;195;215')) +
            // Band under feet
            bandLine(80,215,120,215,
                anim('x1','80;70;80') + anim('x2','120;130;120') + anim('y1','215;195;215') + anim('y2','215;195;215')) +
            // Arms holding band handles
            line(100,60,85,85, C.body, W, anim('y1','60;90;60') + anim('y2','85;115;85')) +
            line(100,60,115,85, C.body, W, anim('y1','60;90;60') + anim('y2','85;115;85')) +
            bandLine(80,215,85,85, anim('y2','85;115;85') + anim('x1','80;70;80') + anim('y1','215;195;215')) +
            bandLine(120,215,115,85, anim('y2','85;115;85') + anim('x1','120;130;120') + anim('y1','215;195;215')) +
            label('Band Squat Jumps') +
        close;
    };

    animations['Skater Jumps'] = () => {
        // Lateral jumping side to side
        return open + floor +
            head(70,40,
                `<animate attributeName="cx" values="70;130;70" dur="2s" repeatCount="indefinite"/>` +
                `<animate attributeName="cy" values="40;40;40" dur="2s" repeatCount="indefinite"/>`) +
            // Torso
            `<line x1="70" y1="52" x2="70" y2="120" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="70;130;70" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="70;130;70" dur="2s" repeatCount="indefinite"/>
            </line>` +
            // Landing leg
            `<line x1="70" y1="120" x2="65" y2="175" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="70;130;70" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="65;125;65" dur="2s" repeatCount="indefinite"/>
            </line>` +
            `<line x1="65" y1="175" x2="65" y2="215" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="65;125;65" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="65;125;65" dur="2s" repeatCount="indefinite"/>
            </line>` +
            // Trailing leg (crossed behind)
            `<line x1="70" y1="120" x2="85" y2="160" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="70;130;70" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="85;115;85" dur="2s" repeatCount="indefinite"/>
            </line>` +
            // Arms swinging
            `<line x1="70" y1="65" x2="50" y2="85" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="70;130;70" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="50;145;50" dur="2s" repeatCount="indefinite"/>
            </line>` +
            `<line x1="70" y1="65" x2="90" y2="80" stroke="${C.body}" stroke-width="${W}" stroke-linecap="round">
                <animate attributeName="x1" values="70;130;70" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="x2" values="90;115;90" dur="2s" repeatCount="indefinite"/>
            </line>` +
            label('Skater Jumps') +
        close;
    };

    // ────────────────────────────────────────
    // PUBLIC API
    // ────────────────────────────────────────

    /**
     * Return an SVG animation string for the given exercise name.
     * Returns null if the exercise has no animation defined.
     */
    function getAnimation(exerciseName) {
        const fn = animations[exerciseName];
        return fn ? fn() : null;
    }

    /**
     * Render an exercise animation into a container element.
     * Falls back to a placeholder icon if no animation exists.
     */
    function render(container, exerciseName) {
        const svg = getAnimation(exerciseName);
        if (svg) {
            container.innerHTML = svg;
        } else {
            container.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--text-muted)">
                <div style="font-size:3rem;margin-bottom:0.5rem">\uD83C\uDFCB\uFE0F</div>
                <div style="font-size:0.8rem">No animation available</div>
            </div>`;
        }
    }

    return { getAnimation, render };
})();
