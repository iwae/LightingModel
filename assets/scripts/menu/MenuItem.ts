import { _decorator, Color, Component, director, EventHandler, Label, Node, Sprite } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('MenuItem')
@executeInEditMode(true)

export class MenuItem extends Component {
    @property(Sprite)
    BgSprite: Sprite = null;
    @property(Sprite)
    SideSprite: Sprite = null;
    @property(Label)
    NameLable: Label = null;
    @property(Color)
    set MenuItemBgColor(v) {
        this.BgColor = v;
        this.resetColor();
    }
    get MenuItemBgColor() {
        return this.BgColor;
    }
    @property(Color)
    set MenuItemSideColor(v) {
        this.SideColor = v;
        this.resetColor();
    }
    get MenuItemSideColor() {
        return this.SideColor;
    }
    @property({ visible: false })
    private BgColor: Color = new Color(40, 40, 40, 255);
    @property({ visible: false })
    private SideColor: Color = new Color(0, 130, 180, 255);

    private pressStrenth = 0.75;
    private _uuid;
    public callback: Function;
    public eventData: any;


    init(name: string, uuid, cb: Function) {
        this.NameLable.string = name;
        this._uuid = uuid;
        cb && (this.callback = cb);
    }

    onEnable() {
        this.resetColor();
        this.node.on(Node.EventType.TOUCH_END, this.onClick, this);
    }
    onDisable() {
        this.node.off(Node.EventType.TOUCH_END, this.onClick, this);
    }

    resetColor() {
        this.BgSprite && (this.BgSprite.color = this.BgColor);
        this.SideSprite && (this.SideSprite.color = this.SideColor);
    }

    onClick() {
        this.callback();
        this.BgSprite.color = new Color(this.BgColor.r * this.pressStrenth, this.BgColor.g * this.pressStrenth, this.BgColor.b * this.pressStrenth);
        director.emit(this._uuid, this.getComponent(MenuItem));
    }

}



