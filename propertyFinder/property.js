// property class 
class Property{
    constructor(title, description, link, price){
        this._title = title;
        this._description = description;
        this._link = link;
        this._price = price;
    }

    get title(){
        return this._title;
    }

    get description(){
        return this._description;
    }

    get link(){
        return this._link;
    }

    get price(){
      return this._price
    }
}

module.exports = Property;
