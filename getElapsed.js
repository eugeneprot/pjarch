// Set the unit values in milliseconds.
var msecPerMinute = 1000 * 60;
var msecPerHour = msecPerMinute * 60;
var msecPerDay = msecPerHour * 24;

// Determine the current date and time.
var today = new Date();

// Determine January 1, at midnight, of the current year.
var january = 0;
var startOfYear = new Date();
startOfYear.setMonth(january);
startOfYear.setDate(1);
startOfYear.setHours(0, 0, 0, 0);

// Determine the difference in milliseconds.
var interval = today.getTime() - startOfYear.getTime();

// Calculate how many days the interval contains. Subtract that
// many days from the interval to determine the remainder.
var days = Math.floor(interval / msecPerDay );
interval = interval - (days * msecPerDay );

// Calculate the hours, minutes, and seconds.
var hours = Math.floor(interval / msecPerHour );
interval = interval - (hours * msecPerHour );

var minutes = Math.floor(interval / msecPerMinute );
interval = interval - (minutes * msecPerMinute );

var seconds = Math.floor(interval / 1000 );

// Display the result.
var msg = days + " days, " + hours + " hours, "
 + minutes + " minutes, " + seconds + " seconds.";
//alert(msg);
WScript.echo(msg);