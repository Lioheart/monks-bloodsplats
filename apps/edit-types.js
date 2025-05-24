import { MonksBloodsplats, log, error, i18n, setting } from "../monks-bloodsplats.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class EditTypes extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(object, options) {
        super(object, options);
    }

    static DEFAULT_OPTIONS = {
        id: "bloodsplats-edit-types",
        tag: "form",
        classes: ["edit-types"],
        window: {
            contentClasses: ["standard-form"],
            icon: "fa-solid fa-list",
            resizable: false,
            title: "MonksBloodsplats.EditTypes"
        },
        actions: {
            reset: EditTypes.resetBloodTypes,
        },
        form: {
            closeOnSubmit: true,
            handler: EditTypes.onSubmitDocumentForm
        },
        position: {
            width: 600
        }
    };

    static PARTS = {
        main: {
            root: true,
            template: "modules/monks-bloodsplats/templates/edit-types.html",
            scrollable: [".item-list"]
        }
    };

    async _preparePartContext(partId, context, options) {
        let bloodOptions = setting("image-lists")
            .filter(i => i.count !== 0)
            .map(i => {
            return {
                id: i.id,
                name: i.name,
            }
        });

        // Populate choices
        let types = {};
        if (["pf1", "D35E"].includes(game.system.id)) {
            for (let [k, v] of Object.entries(CONFIG[game.system.id.toUpperCase()].creatureTypes || {})) {
                types[k] = {
                    id: k,
                    label: game.i18n.localize(v),
                };
            }
        } else if (game.system.id == "dnd5e") {
            for (let [k, v] of Object.entries(CONFIG[game.system.id.toUpperCase()].creatureTypes || {})) {
                types[k] = {
                    id: k,
                    label: v.label,
                };
            }
        } else if (game.system.id == "pf2e") {
            for (let [k, v] of Object.entries(CONFIG.PF2E.monsterTraits || CONFIG.PF2E.creatureTraits || {})) {
                types[k] = {
                    id: k,
                    label: game.i18n.localize(v),
                };
            }
        }
        types = foundry.utils.mergeObject(types, setting("blood-types"));
        types.default.label = "Default";
        types.default.default = true;

        let defaultType = types.default;

        types = Object.values(types).sort((a, b) => {
            if (a.label < b.label) return -1;
            if (a.label > b.label) return 1;
            return 0;
        });

        return {
            types,
            bloodOptions,
            defaultType,
        };
    }

    static async onSubmitDocumentForm(event, form, formData, options = {}) {
        let data = foundry.utils.expandObject(formData.object).types;
        // remove any entires that have a blank type and blank color, remove either blank or color if it's blank
        Object.entries(data).forEach(([k, v]) => {
            if (v.type == "" && v.color == "" && k != "default") {
                delete data[k];
            } else {
                if (v.type == "") delete data[k].type;
                if (v.color == "") delete data[k].color;
            }
        });

        // Make sure the default is set
        if (!data.default.type)
            data.default.type = "blood";
        if (!data.default.color)
            data.default.color = "#ff0000";

        game.settings.set('monks-bloodsplats', 'blood-types', data);
        MonksBloodsplats.blood_types = data;
    }

    static resetBloodTypes() {
        /*
        game.settings.set('monks-bloodsplats', 'blood-types', {
            default: {
                id: "blood"
            }
        });
        this.render(true);
        */
        $('select[name!="types.default.type"]', this.element).val("");
        $('input', this.element).val("");
        $('select[name="types.default.type"]', this.element).val("blood");
    }

    _onRender(context, options) {
        super._onRender(context, options);

        let html = $(this.element);

        //$('button[name="submit"]', html).click(this._onSubmit.bind(this));
        //$('button[name="reset"]', html).click(this.resetBloodTypes.bind(this));
    };
}