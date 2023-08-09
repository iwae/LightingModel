import { _decorator, Component, DirectionalLight, director, instantiate, Node, Prefab, profiler, Toggle } from 'cc';
import { MenuContainer } from './menu/MenuContainer';
const { ccclass, property } = _decorator;

@ccclass('sceneMgr')
export class sceneMgr extends Component {
    @property(Node) scene: Node;
    @property(Prefab) default: Prefab;
    @property(Prefab) cases: Prefab[] = [];
    @property(Toggle) shadowToggle: Toggle;
    @property(Toggle) iblToggle: Toggle;
    @property(Toggle) csmToggle: Toggle;
    @property(Toggle) fogToggle: Toggle;

    @property(MenuContainer) menu: MenuContainer;
    test = 200;
    private _index = 0;
    private _prefab: Prefab = null;
    private _amount = 0;
    start() {

        this.configGlobals();
        this.configMenu();

        profiler.showStats();
    }
    configGlobals() {
        const scene = director.getScene();
        const globals = scene.globals;
        this.shadowToggle.node.on("toggle", (t: Toggle) => {
            globals.shadows.enabled = t.isChecked;
        })
        this.iblToggle.node.on("toggle", (t: Toggle) => {
            globals.skybox.useIBL = t.isChecked;
        })
        this.fogToggle.node.on("toggle", (t: Toggle) => {
            globals.fog.enabled = t.isChecked;
        })
        const light = scene.getComponentInChildren(DirectionalLight);
        this.csmToggle.node.on("toggle", (t: Toggle) => {
            light.enableCSM = t.isChecked;
        })
    }

    configMenu() {
        this.menu.addMenuItem("DefaultScene", () => {
            this.defaultScene();
        })
        this.cases.forEach((c, i) => {
            this.menu.addMenuItem(c.name, () => {
                this.changePrefab(c, i + 1);
            })
        })

    }

    defaultScene() {
        if (this._index == 0) return;
        this._amount = 0;
        this._index = 0;
        this.scene.destroyAllChildren();
        const defaultScene = instantiate(this.default);
        defaultScene.parent = this.scene;
    }
    changePrefab(pfb: Prefab, index = 2) {
        if (this._index == index) return
        this.scene.destroyAllChildren();
        this._index = index;
        this._prefab = pfb;
        this._amount = this.test;
    }

    update(deltaTime: number) {
        if (this._amount > 0) {
            const x = (this._amount % 10 - 5) * 2.6;
            const z = -Math.floor(this._amount / 10) * 2;
            const node = instantiate(this._prefab);
            node.parent = this.scene;
            node.setPosition(x, 0, z);
            this._amount--;
        }

    }
}

