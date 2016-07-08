var o={};
WScript.echo(typeof o);
WScript.echo(typeof o.prototype);
if(o.constructor.prototype==Object.prototype) WScript.echo("Yes!");
else WScript.echo("No!");