function rand(a,b) { return a+Math.floor(Math.random()*(b+1-a)); }
function milieu(A,B,p,q) { if(!p){p=1/2} if(!q){q=p}  return [Math.round(A[0]+(B[0]-A[0])*p), Math.round(A[1]+(B[1]-A[1])*q)]; }
function distance(A,B) { return Math.sqrt(Math.pow(B[0]-A[0],2)+Math.pow(B[1]-A[1],2)); }

function Ordi(id, x, y, r) // instancie un Ordinateur (id) en position x,y et de taille r. Une couleur lui est donnée aléatoirement
{
  this.id = id, this.x = x, this.y = y, this.r = r;
  this.couleur = couleur_alea();
  this.connexions = [];
  this.on = function()
  {
    c1.context.fillStyle = this.couleur;
    c1.drawCircle(this.x, this.y, this.r);
  }
  this.connecter = function(o2) { this.connexions[o2] = true; }
  this.connected = function(o2) { return !(this.connexions[o2] != true);}
  this.contacter = function(dest, hist)
  {
    if(!hist) { var hist = []; }
    hist.push(this.id);
    c1.context.fillStyle = "white";
    c1.drawCircle(this.x, this.y, this.r/4);
    
    if(dest == this.id) { return hist; }
    else
    {
      c = this.connexions;
      var mini = 99999999999, cheminMini = false;
      for(i in c)
      { 
        if(this.connected(i) && hist.indexOf(parseInt(i)) < 0)
        {
          chemin = c1.ordis[i].contacter(dest, hist);      
          console.log(this.id,i,chemin,cheminMini, hist)
          if(chemin != false && chemin.length < mini) { mini = chemin.length; cheminMini = chemin; }
          
        }
      }
      return cheminMini;
    }
  }
}

function Canvas(id, z)
{
  if(!z) { this.zoom = 1; } else { this.zoom = z; }
  this.canvas  = document.querySelector('#'+id);     
  this.context = this.canvas.getContext('2d');
  this.$ = $('#'+id);

  this.drawLine = function (x1,y1, x2, y2) { this.context.beginPath(); this.context.moveTo(x1,y1); this.context.lineTo(x2,y2); this.context.closePath(); this.context.stroke(); }
  this.drawRectangle = function (x1, y1, x2, y2) {  this.context.fillRect(x1 * this.zoom, y1 * this.zoom, x2 * this.zoom, y2 * this.zoom); }
  this.drawCircle = function (x, y, r) { this.context.beginPath(); this.context.arc(x * this.zoom, y * this.zoom, r * this.zoom, 0, Math.PI * 2); this.context.fill(); }
  this.drawPolygon = function (points, stroke)
  {
    this.context.beginPath();
    var pts_array = points.split(',');
    this.context.moveTo(pts_array[0] * this.zoom,pts_array[1] * this.zoom);
    for(i = 2; i < Math.floor(pts_array.length / 2) * 2; i+=2)
    {
      this.context.lineTo(pts_array[i] * this.zoom, pts_array[i+1] * this.zoom);
    }
    
    if(stroke) { this.context.lineWidth = Math.max(stroke * this.zoom, 1); this.context.stroke(); }
    else { this.context.fill(); }
    this.context.lineWidth = 1; 
  }
  this.drawOval = function (x, y, rw, rh, stroke)
  {
    x *= this.zoom; y *= this.zoom; rw *= this.zoom; rh *= this.zoom;
    this.context.save();
    this.context.scale(1,  rh/rw);
    this.context.beginPath();
    this.context.moveTo(x,y);
    this.context.arc(x, y-rh*(rh/rw), rw, 0, 2 * Math.PI);
    this.context.restore();
    if(stroke) { this.context.lineWidth = Math.max(stroke * this.zoom, 1); this.context.stroke(); }
    else { this.context.fill(); }
    this.context.lineWidth = 1;  
  }
  this.canvas.width = 950;    this.canvas.height = taille_ecran().y-100;

  this.dessiner_ordis = function(nb,liaisons_max) // crée et allume des ordis sur toute l'ellipse
  {
    this.ordis = [];
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for(i=0; i < nb; i++)
    {
      p = position_cercles(nb, i, this.canvas.width, this.canvas.height);
      this.ordis[i] = new Ordi(i, p.x, p.y, p.r);
        
    }
    this.connecter(liaisons_max);
  }
  
  this.connecter = function(maxi) // crée aléatoirement jusqu'à Maxi connexions par ordinateur
  {
    for(o1 in this.ordis)
    {
      k = rand(1,maxi);
      for(i=0;i<k;i++)
      {
        do { o2 = rand(0, this.ordis.length -1); } while(o2 == o1)
        if(!this.ordis[o1].connected(o2))
        {
          this.ordis[o1].connecter(o2);
          this.ordis[o2].connecter(o1);
          this.drawLine(this.ordis[o1].x, this.ordis[o1].y, this.ordis[o2].x, this.ordis[o2].y);
        }
      }
    }
    for(o1 in this.ordis) { this.ordis[o1].on(); }
  }
}

function position_cercles(nb, k, w, h) // on a nb ordis, on veut la position du k-ème dans un écran de wxh
{
  var xr = Math.cos(2*k*Math.PI/nb);
  var yr = Math.sin(2*k*Math.PI/nb);
  var x = w*(0.5 + xr*0.45), y = h*(0.5 - yr*0.45);
  var r = Math.min(w, h)*0.05; r = Math.min(r, Math.min(w,h)/nb)
  return {"x":x,"y":y, "r":r};  
}

function pts_alea(w,h,dessin)
{
  if(dessin == "triangle" || dessin == "triangle2") {
    return [
      [rand(w/4,3*w/4),rand(5,h/3)],
      [rand(5,w/3),rand(h/2, h-5)],
      [rand(2*w/3, w-5),rand(h/2, h-5)]
    ];
  }
  else if(dessin == "collier") {
    return [
      [rand(5,w/4),rand(h/3,2*h/3)],
      [rand(3*w/4,w-5),rand(h/3,2*h/3)]
    ];
  }
  else { return ""; }
}
function couleur_alea () { return "rgb("+[rand(0,255),rand(0,255),rand(0,255)]+")"; }

function generate()
{
  var h = taille_ecran().y-100, w = Math.min(991950, taille_ecran().x);
  var nb = $("#nb_ordis").val();
  c1.canvas.height = h; c1.canvas.width = w;
  c1.dessiner_ordis(nb, Math.ceil(nb /2));  
}
