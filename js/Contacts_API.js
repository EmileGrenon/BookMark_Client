class Contacts_API {
    static API_URL() { return "http://localhost:5000/api/fav" };
    static async Get(id = null) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + (id != null ? "/" + id : ""),
                success: contacts => { resolve(contacts); },
                error: (xhr) => { console.log(xhr); resolve(null); }
            });
        });
    }
    static async Save(contact, create = true) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL(),
                type: create ? "POST" : "PUT",
                contentType: 'application/json',
                data: JSON.stringify(contact),
                success: (/*data*/) => { resolve(true); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        });
    }
    static async Delete(id) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + "/" + id,
                type: "DELETE",
                success: () => { resolve(true); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        });
    }
    static async GetCategorie() {
        return new Promise(resolve => {
            $.ajax({
                url: "http://localhost:5000/api/categorie",
                contentType: 'application/json',
                type: "GET",
                success: (categorie) => { resolve(categorie.categorie); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        })
    }
    static async GetFavByCategorie(categorie) {
        return new Promise(resolve => {
            $.ajax({
                url: "http://localhost:5000/api/categorie/" + categorie,
                contentType: 'application/json',
                type: "GET",
                success: (favoris) => { resolve(favoris); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        })
    }
}