/*global $,nwdialog*/
'use strict';


var SYM = SYM || {};
SYM.LAST_CHAR = 225; // For drawing the font preview
SYM.BLANK = 0x20;
SYM.MILLIOHM = 0x62;
SYM.BATT = 0x63;
SYM.RSSI = 0x01;
SYM.AH_RIGHT = 0x12D;
SYM.AH_LEFT = 0x12C;
SYM.THR = 0x95;
SYM.VOLT = 0x1F;
SYM.AH_DECORATION_UP = 0x15;
SYM.WIND_SPEED_HORIZONTAL = 0x86;
SYM.WIND_SPEED_VERTICAL = 0x87;
SYM.FLY_M = 0x9F;
SYM.ON_M = 0x9E;
SYM.AH_CENTER_LINE = 0x13A;
SYM.AH_CENTER_LINE_RIGHT = 0x13B;
SYM.AH_BAR9_0 = 0x14C;
SYM.AZIMUTH = 0x05;
SYM.AH_DECORATION = 0x131;
SYM.AMP = 0x6A;
SYM.MAH = 0x99;
SYM.WH = 0x6D;
SYM.WATT = 0x71;
SYM.MAH_KM_0 = 0x6B;
SYM.MAH_KM_1 = 0x6C;
SYM.MAH_MI_0 = 0x93;
SYM.MAH_MI_1 = 0x94;
SYM.WH_KM = 0x6E;
SYM.WH_MI = 0x6F;
SYM.GPS_SAT1 = 0x08;
SYM.GPS_SAT2 = 0x09;
SYM.GPS_HDP1 = 0x0E;
SYM.GPS_HDP2 = 0x0F;
SYM.KMH = 0x90;
SYM.KMH_3D = 0x88;
SYM.MPH = 0x91;
SYM.MPH_3D = 0x89;
SYM.ALT_M = 0x76;
SYM.ALT_FT = 0x78;
SYM.LAT = 0x03;
SYM.LON = 0x04;
SYM.AIR = 0x8C;
SYM.DIRECTION = 0x17;
SYM.DIR_TO_HOME = 0x13C;
SYM.SCALE = 0x0D;
SYM.DIST_KM = 0x7E;
SYM.DIST_MI = 0x80;
SYM.M = 0x82;
SYM.MI = 0x84;
SYM.HOME = 0x10;
SYM.TRIP_DIST = 0x75;
SYM.HEADING = 0x0C;
SYM.DEGREES = 0x0B;
SYM.HEADING_N = 0xC8;
SYM.HEADING_E = 0xCA;
SYM.HEADING_W = 0xCB;
SYM.HEADING_DIVIDED_LINE = 0xCC;
SYM.HEADING_LINE = 0xCD;
SYM.VARIO_UP_2A = 0x155;
SYM.M_S = 0x8F;
SYM.FT_S = 0x8D;
SYM.CLOCK = 0xA0;
SYM.ZERO_HALF_TRAILING_DOT = 0xA1;
SYM.ZERO_HALF_LEADING_DOT = 0xB1;
SYM.ROLL_LEFT = 0xAD;
SYM.ROLL_LEVEL = 0xAE;
SYM.ROLL_RIGHT = 0xAF;
SYM.PITCH_UP = 0xB0;
SYM.PITCH_DOWN = 0xBB;
SYM.TEMP_C = 0x97;
SYM.TEMP_F = 0x96;
SYM.BARO_TEMP = 0xC0;
SYM.IMU_TEMP = 0xC1;
SYM.TEMP = 0xC2;
SYM.GFORCE = 0xBC;
SYM.GFORCE_X = 0xBD;
SYM.GFORCE_Y = 0xBE;
SYM.GFORCE_Z = 0xBF;
SYM.RPM = 0x8B;
SYM.ESC_TEMPERATURE = 0xC3;
SYM.RSS2 = 0x11;
SYM.DB = 0x12;
SYM.DBM = 0x13;
SYM.MW = 0x72;
SYM.SNR = 0x14;
SYM.LQ = 0x02;
SYM.GLIDESLOPE = 0x9C;
SYM.DIST_NM = 0x81;
SYM.NM = 0x85;
SYM.KT_3D = 0x8A;
SYM.KT = 0x92;
SYM.HUND_FTM = 0x8E;
SYM.MAH_NM_0 = 0x60;
SYM.MAH_NM_1 = 0x61;
SYM.AH_NM = 0x3F;
SYM.WH_NM = 0x70;
SYM.VTX_POWER = 0x27;
SYM.MAX = 0xCE;
SYM.PROFILE = 0xCF;

SYM.AH_AIRCRAFT0 = 0x1A2;
SYM.AH_AIRCRAFT1 = 0x1A3;
SYM.AH_AIRCRAFT2 = 0x1A4;
SYM.AH_AIRCRAFT3 = 0x1A5;
SYM.AH_AIRCRAFT4 = 0x1A6;

SYM.AH_CROSSHAIRS = new Array(0x166, 0x1A4, new Array(0x190, 0x191, 0x192), new Array(0x193, 0x194, 0x195), new Array(0x196, 0x197, 0x198), new Array(0x199, 0x19A, 0x19B), new Array (0x19C, 0x19D, 0x19E), new Array (0x19F, 0x1A0, 0x1A1));

var FONT = FONT || {};

FONT.initData = function () {
    if (FONT.data) {
        return;
    }
    FONT.data = {
        // default font file name
        loaded_font_file: 'default',
        // array of arry of image bytes ready to upload to fc
        characters_bytes: [],
        // array of array of image bits by character
        characters: [],
        // an array of base64 encoded image strings by character
        character_image_urls: [],
    }
    FONT.isLoaded = false;
};

FONT.constants = {
    SIZES: {
        /** NVM ram size for one font char, actual character bytes **/
        MAX_NVM_FONT_CHAR_SIZE: 54,
        /** NVM ram field size for one font char, last 10 bytes dont matter **/
        MAX_NVM_FONT_CHAR_FIELD_SIZE: 64,
        CHAR_HEIGHT: 18,
        CHAR_WIDTH: 12,
        LINE: 30
    },
    COLORS: {
        // black
        0: 'rgba(0, 0, 0, 1)',
        // also the value 3, could yield transparent according to
        // https://www.sparkfun.com/datasheets/BreakoutBoards/MAX7456.pdf
        1: 'rgba(255, 255, 255, 0)',
        // white
        2: 'rgba(255,255,255, 1)'
    }
};


/**
 * Each line is composed of 8 asci 1 or 0, representing 1 bit each for a total of 1 byte per line
 */
FONT.parseMCMFontFile = function (data) {
    data = data.split("\n");
    // clear local data
    FONT.data.characters.length = 0;
    FONT.data.characters_bytes.length = 0;
    FONT.data.character_image_urls.length = 0;

    // make sure the font file is valid
    if (data.shift().trim() != 'MAX7456') {
        var msg = 'that font file doesnt have the MAX7456 header, giving up';
        console.debug(msg);
        Promise.reject(msg);
    }

    var character_bits = [];
    var character_bytes = [];

    // hexstring is for debugging
    FONT.data.hexstring = [];
    var pushChar = function () {
        FONT.data.characters_bytes.push(character_bytes);
        FONT.data.characters.push(character_bits);
        FONT.draw(FONT.data.characters.length - 1);
        //$log.debug('parsed char ', i, ' as ', character);
        character_bits = [];
        character_bytes = [];
    };

    for (var i = 0; i < data.length; i++) {

        var line = data[i];
        // hexstring is for debugging
        FONT.data.hexstring.push('0x' + parseInt(line, 2).toString(16));

        // every 64 bytes (line) is a char, we're counting chars though, which are 2 bits
        if (character_bits.length == FONT.constants.SIZES.MAX_NVM_FONT_CHAR_FIELD_SIZE * (8 / 2)) {
            pushChar()
        }

        for (var y = 0; y < 8; y = y + 2) {
            var v = parseInt(line.slice(y, y + 2), 2);
            character_bits.push(v);
        }
        character_bytes.push(parseInt(line, 2));

    }

    // push the last char
    pushChar();

    FONT.isLoaded = true;
    return FONT.data.characters;
};

/**
 * returns a canvas image with the character on it
 */
var drawCanvas = function (charAddress) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");

    // TODO: do we want to be able to set pixel size? going to try letting the consumer scale the image.
    var pixelSize = pixelSize || 1;
    var width = pixelSize * FONT.constants.SIZES.CHAR_WIDTH;
    var height = pixelSize * FONT.constants.SIZES.CHAR_HEIGHT;

    canvas.width = width;
    canvas.height = height;

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            if (!(charAddress in FONT.data.characters)) {
                console.log('charAddress', charAddress, ' is not in ', FONT.data.characters.length);
            }
            var v = FONT.data.characters[charAddress][(y * width) + x];
            ctx.fillStyle = FONT.constants.COLORS[v];
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
    return canvas;
};

FONT.draw = function (charAddress) {
    var cached = FONT.data.character_image_urls[charAddress];
    if (!cached) {
        cached = FONT.data.character_image_urls[charAddress] = drawCanvas(charAddress).toDataURL('image/png');
    }
    var img = new Image();
    img.src = cached;

    return img;
};

FONT.symbol = function (hexVal) {
    return String.fromCharCode(hexVal);
};

FONT.write = function($obj, string)
{
    $obj.empty();
    string = String(string);
    for (var i = 0; i < string.length; i++) {
        $obj.append(FONT.draw(string.charCodeAt(i)));
    }
    return true;
}

let simData;
let xPlane;
let isPaused = true;
let needToReloadAircraft = false;

FONT.initData();
$.get('/resources/osd/default.mcm', function (data) {
    FONT.parseMCMFontFile(data);
    $('.lat-title').replaceWith(FONT.draw(SYM.LAT));
    $('.lon-title').replaceWith(FONT.draw(SYM.LON));
    $('.heading-title').replaceWith(FONT.draw(SYM.HEADING));
    $('.kmh-title').replaceWith(FONT.draw(SYM.KMH));
    $('.alt-title').replaceWith(FONT.draw(SYM.ALT_M));
    FONT.write($('.alt-title-msl'), FONT.symbol(SYM.ALT_M)+'MSL');
    FONT.write($('.alt-title-agl'), FONT.symbol(SYM.ALT_M)+'AGL');
    $('.throttle-title').replaceWith(FONT.draw(SYM.THR));
    $('.satelites-title').replaceWith(FONT.draw(SYM.GPS_SAT1));
    $('.dist-home-title').replaceWith(FONT.draw(SYM.HOME));
    $('.vario-title').replaceWith(FONT.draw(SYM.M_S));
    $('.dir-to-home').append(FONT.draw(SYM.DIR_TO_HOME));

    FONT.write($('.pitch-title'), 'P');
    FONT.write($('.roll-title'), 'R');
    FONT.write($('.baro-title'), 'GPA');


    let crossline = 5;
    let $line = $('#line');
    let $dot = $('.dot');
    for (var i=0; i<SYM.AH_CROSSHAIRS[crossline].length; i++) {
        $dot.append(FONT.draw(SYM.AH_CROSSHAIRS[crossline][i]));
    }
    for (i = 0; i < 17; i++) {
        $line.append(FONT.draw(SYM.AH_BAR9_0 + 4));
    }
    xPlane = getXplane();

    xPlane.requestDataRef('sim/time/paused', 10, function (ref, value) {
        isPaused = value*1;
        $('.disableIfNotPaused').prop('disabled', ! isPaused);
        if (! value && needToReloadAircraft) {
            xPlane.sendCommand('sim/operation/reload_aircraft');
            needToReloadAircraft = false;
        }
    });
    xPlane.requestDataRef('sim/operation/override/override_planepath[0]', 10, function (ref, value) {
        if (value) {
            xPlane.setDataRef('sim/operation/override/override_planepath[0]', 0);
            needToReloadAircraft = true;
            console.log('Set override_planepath[0] to 0');
        }
    });


    $('#send_latlon').on('click', function() {
        if (!isPaused) {
            return false;
        }
        let value = $('#set_latlon').val().split( /[, ]+/);
        let altitude = $('#set_altitude').val();
        xPlane.setDataRef('sim/operation/override/override_planepath[0]', 0);
        xPlane.sendVEHX(0, value[0], value[1], altitude, 0, 0, 0);
    });
    $('.btn_set_mode').on('click', function () {
        let $this = $(this);
        let value = $this.data('value')*1;
        getMspHelper().setSimulatorMode(value);
    })
});

document.addEventListener('keypress', (event) => {
    const keyName = event.key;
    if (keyName === 'p') {
        xPlane.sendCommand('sim/operation/pause_toggle');
    }
});

function onOsdLoad()
{
    simData = getFlightData();

    if (FONT.isLoaded) {
        FONT.write($('#latitude'), (simData.lat / 10000000).toFixed(7));
        FONT.write($('#longitude'), (simData.lon / 10000000).toFixed(7));

        $('#line').css({'transform': 'rotate(' + (simData.roll * -1) + 'deg)'});
        $('#line').css({'top': (100 + (simData.pitch * -1)) + 'px'});
        FONT.write($('#pitch'), String((simData.pitch * -1).toFixed(2)));
        FONT.write($('#roll'), String((simData.roll * -1).toFixed(2)));
        FONT.write($('#heading'), String(simData.course.toFixed()).padStart(3, '0'));
        FONT.write($('#alt'), String((simData.alt / 100).toFixed()));
        FONT.write($('#agl'), String(simData.agl));
        FONT.write($('#speed'), String((simData.speed * 3.6 / 100).toFixed(1)));
        FONT.write($('#baro'), String((simData.baro * 3386.39 / 100).toFixed()));
        FONT.write($('#satelites'), String(simData.numSat));

        let telemetry = getTelemetryData();
        FONT.write($('.flight-mode'), String(telemetry.flightModeText));
        FONT.write($('.error-messages'), String(telemetry.message));
        FONT.write($('.arming-status'), String(telemetry.armed? 'ARMED': 'DISARMED'));
        FONT.write($('#throttlePercent'), String(telemetry.throttlePercent));
        FONT.write($('#dist-home'), String((telemetry.distanceToHome).toFixed()));
        FONT.write($('#altHome'), String((telemetry.homeAltitude).toFixed()));
        FONT.write($('#vario'), String((telemetry.variometer).toFixed(2)));
        $('.dir-to-home').css({'transform': 'rotate(' + (telemetry.directionToHome - simData.course).toFixed() + 'deg)'});
        $('.loading').hide();

        if (! isPaused) {
            // inputs
            $('#set_latlon').val((simData.lat / 10000000).toFixed(7) + ', ' + (simData.lon / 10000000).toFixed(7));
            $('#set_altitude').val((simData.alt / 100).toFixed());
            $('.msg-set-gps').show();
        } else {
            $('.msg-set-gps').hide();
        }
        if (isXplaneConnected()) {
            $('.msg-connect-inav').hide();
        } else {
            $('.msg-connect-inav').show();
        }
    }
    setTimeout(function() {
        onOsdLoad();
    }, 100);
}

window.onload = function () {
    $('.toggle').each(function(index, elem) {
        var switchery = new Switchery(elem, {
            color: '#37a8db',
            secondaryColor: '#c4c4c4'
        });
        $(elem).on("change", function (evt) {
            switchery.setPosition();
        });
        $(elem).removeClass('toggle');
    });
    $("#xplane-gps-enabled").on('change', function() {
        if ($(this).is(':checked')) {
            simData.fix = 2;
            simData.numSat = 10;
        } else {
            simData.fix = 0;
            simData.numSat = 0;
        }
    });

    onOsdLoad();
    if (simData.fix) {
        $('#xplane-gps-enabled').click();
    }
}

setInterval(function() {
    checkTelemetry();
}, 100);

