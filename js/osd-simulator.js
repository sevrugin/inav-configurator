function onOsdLoad()
{
    var data = getFlightData();
    console.log(data);
    $('#latitude').text(data.lat.toFixed() / 10000000);
    $('#longitude').text(data.lon.toFixed() / 10000000);

    $('#line').css({'transform' : 'rotate('+ (data.roll * -1) +'deg)'});
    $('#line').css({'top' : (100 + (data.pitch * -1)) + 'px'});
    $('#pitch').text((data.pitch * -1).toFixed());
    $('#roll').text((data.roll * -1).toFixed());
    $('#heading').text(data.course.toFixed());
    $('#alt').text((data.alt / 100).toFixed());
    $('#speed').text((data.speed * 3.6 / 100).toFixed());
    $('#baro').text((data.baro * 3386.39 / 100).toFixed());
    setTimeout(function() {
        onOsdLoad();
    }, 100);
}

window.onload = onOsdLoad;
