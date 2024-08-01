class Card{

  //suites = ["♠", "♥", "♣", "♦"];
  //specials = ["Ace", "Jack", "Queen", "King"];
  //cPs = 12;
  suites = ["RED", "ORANGE", "GREEN", "BLUE"];
  specials = ["SKIP", "REVERSE", "DRAW2", "WILD"];
  cPs = 14;
  maxNum = this.cPs - this.specials.length;

  constructor(num){
    const tmpC = Math.floor(num/this.cPs) % this.suites.length;
    const tmpN = num % this.cPs;
    
    this.id = num;
    this.suite = this.suites[tmpC];
    this.number = tmpN;
    this.string = tmpN;    
  }
  
  draw(elem){
    elem = elem || document.body;
    const xPos = (this.id % this.cPs) * 8;
    const yPos = Math.floor(this.id / this.cPs) * 12;
    const text = this.suite + " " + this.string + " " + this.id;
    const c = document.createElement("A");
    const t = document.createTextNode(text);
    c.className = "card";
    c.style.cssText = "background-position:-" 
      + (xPos) + "em -" + (yPos) + "em";
    elem.appendChild(c); 
    c.appendChild(t);
    
    return c;
  }
}

class UnoCard extends Card{
  suites = ["RED", "ORANGE", "GREEN", "BLUE"];
  specials = ["SKIP", "REVERSE", "DRAW2", "WILD"];
  cPs = 14;
  
  constructor(num){
    super(num);
    const tmpC = Math.floor(num/this.cPs) % this.suites.length;
    const tmpN = num%this.cPs;
    
    
    if(this.number > 9){
      this.string = this.specials[this.number - this.maxNum];
      this.number = 20;
    }

    if(tmpN === 13 && num < 56){
      this.string = this.specials[3];
      this.suite = null;
      this.number = 50;
    }
    
    if(tmpN === 13 && num > 56){
      this.string = "DRAW4";
      this.suite = null;
      this.number = 50;
    }
    
  }
}

class Deck{
  cards = [];
  constructor(cardCount){
    cardCount = cardCount || 0;
    for(let i =0; i < cardCount; i++){
      this.addCard(new Card(i));
    }
  }
  
  setCards(cards){
    this.cards = cards || this.cards;
    return this;
  }
  
  addCard(card){
    this.cards.push(card);
    return this;
  }
  
  dealCard(){
    const r = Math.floor(Math.random() * this.cards.length);
    const card = this.cards[r];
    this.cards.splice(r,1);
    return card;
  }

}

class UnoDeck extends Deck{
  constructor(cardCount){
    super(0);
    for(let i =0; i < cardCount; i++){
      if( i%14 != 0 || i < 50)
        this.addCard(new UnoCard(i));
    } 

  }

}

class Player{
  name = "NO NAME";
  points = 0;
  rank = 0;
  hand = [];
  
  constructor(name,rank,points){
    this.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    this.name= name || this.name;
    this.rank = rank || this.rank;
    this.points = points || this.points;
  }
  takeCard(card){
    this.hand.push(card);
    return this;
  }
  discard(handIndex){
    const c = this.hand[handIndex];
    this.hand.splice(handIndex,1);
    return c;
  }
}

class CardGame{
  round = 0;
  activePlayer = 0;
  direction = 1;
  reverse = false; // or -1;
  handSize = 7;
  activeCards = [];
  preceedingAction = function(){};
  
  constructor(deck,handSize,players){
    this.deck = deck;
    this.handSize = handSize || this.handSize;
    this.players = players;

   this.play();
  }

  getActivePlayer(){
    return this.players[this.activePlayer];
  }
  
  getActiveCard(){
    return this.activeCards[this.activeCards.length -1];
  }
  
  drawCard(){
    this.getActivePlayer().takeCard(this.deck.dealCard());
    return this.setPlayables();
  } 
  
  dealCards(cards){
    for(let i = 0; i < cards; i++){
      this.players.
        forEach(p => p.takeCard(this.deck.dealCard()));
    }
  }
  advanceTurn(){
    
    this.activePlayer += this.direction;
    if(this.activePlayer < 0) this.activePlayer = this.players.length-1;
    if(this.activePlayer >= this.players.length) this.activePlayer = 0;
    
    this.doTurn();
  }
  play(){
    this.activateGUI();
    this.activateTools();
    this.dealCards(this.handSize);
    this.start();
  }
  playCard(card,p){
    console.log(card);
    this.activeCards.push(card);
  }
  
  activateGUI(){
    this.players.forEach(p => {
      const d = document.createElement("div");
      const di = document.createElement("div");
      const dh = document.createElement("div");
      d.className = "player";
      di.className = "info";
      dh.className = "hand hide";
      d.setAttribute("id",p.id);
      di.setAttribute("id","i-" + p.id);
      dh.setAttribute("id","h-" + p.id);
      document.body.appendChild(d);
      d.appendChild(di);
      d.appendChild(dh);
     // di.innerHTML("<h3>"+p.name + "</h3>");
      
    });
  } 
  
  activateTools(){  }
  
  start(){ this.doTurn();}
  
  doTurn(){
    const player = this.players[this.activePlayer++];    
    
    this.setPlayables();
    this.showHand(player);

  }
  
  setPlayables(){
    let isPlayable = false;
    const hand = this.getActivePlayer().hand;
    hand.forEach(c => {
      c.playable = this.playable(c);
      isPlayable = isPlayable || this.playable(c);
    });
    return isPlayable;
  }

  playable(card){ return true; }
  
  gameOver(turn){ return true; }
  
  showHand(p){
    this.players.forEach(ps=>{
      const psDom = document.getElementById("h-" + ps.id);
      psDom.classList.add("hide");
      psDom.innerHTML = "";
    });
    
    const pDom = document.getElementById("h-" + p.id);
    pDom.innerHTML = "";
    p.hand.forEach((c,i) => {
      const cDom = c.draw(pDom);
      cDom.index = i;
      if(c.playable){
        cDom.className += " playable";
        cDom.addEventListener(
          "click",(e)=> this.cardClick(e.target,this,p),false
        );
      }  
    });
    pDom.classList.remove("hide");
      
    const a = this.activeCards[this.activeCards.length-1];
    console.log();
    console.log();
    console.log("active: " + a.suite + " " + a.number);
    console.log("round: " + this.round);
    console.log("player: " + p.name);
    console.log("cards left: " + p.hand.length);
    console.log();
  }

  cardClick(e,g,player){
    console.log(player.name);
    console.log(g.players);
  }
}

class UnoGame extends CardGame{
  
  constructor(players){
    super(new UnoDeck(112), 7, players);
  }
 
  start(){
    const c = this.deck.dealCard();
    const cDom = document.getElementById("cards");
    
    this.activeCards.push(c);
    c.draw(cDom);
    
    if(c.string != c.number) this.start();
    else this.doTurn();
  }

  doTurn(){
    
    this.preceedingAction();
    
    const player = this.getActivePlayer();  
    
    if(!this.setPlayables()) this.drawCard();    
    this.showHand(player);  

    console.log("!!!!!" + player.name);
    
  }  
  
  playable(c){
    const ac = this.activeCards[this.activeCards.length -1];
    return c.suite === null || 
      (c.string === ac.string || c.suite == ac.suite);
  }
  
  activateTools(){
    document.getElementById("skip").addEventListener("click",(e) => this.skipClick(this));
    document.getElementById("draw").addEventListener("click",(e) =>  this.drawClick(this));
    document.getElementById("suite").addEventListener("change",(e) =>  this.setSuiteChange(e.target,this));
  }
  
  skipClick(g){
    g.advanceTurn();
  }

  drawClick(g){
    const player = g.getActivePlayer();
    g.drawCard();
    g.showHand(player);
  }
  
  setSuiteChange(elem,g){
    const a = g.getActiveCard();
    const player = g.getActivePlayer();
    if(a.suite === null){
      a.suite = elem.value;
      g.advanceTurn();
    }
    elem.value = "null";
  }
  
  cardClick(elem,g,p){
    document.getElementById("suite").value = "null";
    const ac = document.getElementById("cards");
    ac.appendChild(elem);
    g.playCard(p.discard(elem.index),p);
    
    if(g.getActiveCard().suite !== null) {
      g.advanceTurn();
    }
  }
  
  playCard(card,p){
    this.activeCards.push(card);
    
    if(card.string === "DRAW4")
      this.preceedingAction = function(){
        this.preceedingAction = function(){}
        for(let i = 0; i < 4; i++) this.drawCard();
      }

    if(card.string === "DRAW2")
      this.preceedingAction = function(){
        this.preceedingAction = function(){}
        for(let i = 0; i < 2; i++) this.drawCard();
      }

    if(card.string === "REVERSE" && this.players.length > 2) 
      this.preceedingAction = function(){
        this.preceedingAction = function(){}
        this.reverse = !this.reverse;
      }
      
    if(card.string === "SKIP" ||
       (card.string === "REVERSE" && this.players.length < 3))
      this.preceedingAction = function(){
        this.preceedingAction = function(){}
        this.advanceTurn();
      }    
    if(this.endGame(p)) this.scoreRound();
  }

  endGame(p){
    console.log("EG:" + this.getActivePlayer().hand.length);
    if(this.getActivePlayer().hand.length < 1){
      return alert("YOU WIN!");
      return true;
    }
    return false;
    
  }
  scoreRount(){
    alert("!!!!!");
  }
  
}


var p1 = new Player("Gus");
var p2 = new Player("Bonnie");
var g = new UnoGame([p1,p2]);
