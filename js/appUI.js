//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderContacts();
    $('#createContact').on("click", async function () {
        saveContentScrollPosition();
        renderCreateContactForm();
    });
    $('#abort').on("click", async function () {
        renderContacts();
    });
    renderCategorie();
}
async function renderCategorie() {
    let categorie = await Contacts_API.GetCategorie();
    $(".dropdown-menu").append(
        $(`
        <div class="dropdown-item" onclick="renderContacts()">Toutes les catégories
        </div>

        <div class="dropdown-divider"></div>
        `));
    for (let cat of categorie) {
        $(".dropdown-menu").append(
            $(`
            <div class="dropdown-item" onclick="renderContacts('${cat}')">
                        ${cat}
                    </div>
            `));
    }
    $(".dropdown-menu").append(
        $(`
        <div class="dropdown-divider"></div>

        <div class="dropdown-item" id="aboutCmd" onclick="renderAbout()">
            <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
        </div>
        `));
    
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de contacts</h2>
                <hr>
                <p>
                    Petite application de gestion de contacts à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderContacts(categorie = null) {
    let contacts = null
    if (categorie == null) {
        contacts = await Contacts_API.Get();
    }
    else {
        contacts = await Contacts_API.GetFavByCategorie(categorie);
    }
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createContact").show();
    $("#abort").hide();
    
    eraseContent();
    if (contacts !== null) {
        contacts.forEach(contact => {
            $("#content").append(renderContact(contact));
        });
        
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditContactForm(parseInt($(this).attr("editContactId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteContactForm(parseInt($(this).attr("deleteContactId")));
        });
        $(".contactRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateContactForm() {
    renderContactForm();
}
async function renderEditContactForm(id) {
    showWaitingGif();
    let contact = await Contacts_API.Get(id);
    if (contact !== null)
        renderContactForm(contact);
    else
        renderError("Contact introuvable!");
}
async function renderDeleteContactForm(id) {
    showWaitingGif();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let contact = await Contacts_API.Get(id);
    eraseContent();
    if (contact !== null) {
        $("#content").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le favoris suivant?</h4>
            <br>
            <div class="contactRow" contact_id=${contact.Id}">
                <div class="contactContainer">
                    <div class="contactLayout">
                        <div class="contactName">${contact.Name}</div>
                        <div class="contactPhone">${contact.Phone}</div>
                        <div class="contactEmail">${contact.Email}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteContact').on("click", async function () {
            showWaitingGif();
            let result = await Contacts_API.Delete(contact.Id);
            if (result)
                renderContacts();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderContacts();
        });
    } else {
        renderError("Favoris introuvable!");
    }
}
function newContact() {
    contact = {};
    contact.Id = 0;
    contact.Name = "";
    contact.Phone = "";
    contact.Email = "";
    return contact;
}
function renderContactForm(contact = null) {
    $("#createContact").hide();
    $("#abort").show();
    eraseContent();
    let create = contact == null;
    if (create) contact = newContact();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="contactForm">
            <input type="hidden" name="Id" value="${contact.Id}"/>

            <label for="Name" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Name" 
                id="Name" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrez un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${contact.Name}"
            />
            <label for="Phone" class="form-label">Url </label>
            <input
                class="form-control URL"
                name="Phone"
                id="Phone"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer votre Url" 
                InvalidMessage="Veuillez entrer un Url valide"
                value="${contact.Phone}" 
            />
            <label for="Email" class="form-label">Categorie </label>
            <input 
                class="form-control Alpha"
                name="Email"
                id="Email"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${contact.Email}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#contactForm').on("submit", async function (event) {
        event.preventDefault();
        let contact = getFormData($("#contactForm"));
        contact.Id = parseInt(contact.Id);
        showWaitingGif();
        let result = await Contacts_API.Save(contact, create);
        if (result)
            renderContacts();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderContacts();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderContact(contact) {
    return $(`
     <div class="contactRow" contact_id=${contact.Id}">
        <div class="contactContainer noselect">
            <div class="contactLayout">
                <span class="contactName"><img src='http://www.google.com/s2/favicons?sz=32&domain=${contact.Phone}'/><a href="${contact.Phone}">\t${contact.Name}</a></span>
                <span class="contactEmail">${contact.Email}</span>
            </div>
            <div class="contactCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editContactId="${contact.Id}" title="Modifier ${contact.Name}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteContactId="${contact.Id}" title="Effacer ${contact.Name}"></span>
            </div>
        </div>
    </div>           
    `);
}