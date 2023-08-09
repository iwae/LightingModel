import { _decorator, Color, Component, director, EventHandler, instantiate, Label, Layout, Node, Prefab, Size, UITransform, Vec3 } from 'cc';
import { MenuItem } from './MenuItem';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('MenuContainer')
@executeInEditMode(true)
export class MenuContainer extends Component {
    @property(Size)
    set MenuItemSize(v) {
        this.Size = v;
        this.setMenuNode();
    }
    get MenuItemSize() {
        return this.Size;
    }
    @property(Prefab)
    MenuItem: Prefab = null;
    @property(Node)
    MenuRootNode: Node = null;
    @property(Node)
    BtnNode: Node = null;
    @property({ visible: false })
    private Size: Size = new Size(200, 30);
    private _item: MenuItem = null;
    private _isVisible: boolean = true;


    onEnable() {
        this.initLayout();
        if (this.BtnNode) {
            this.BtnNode.on(Node.EventType.TOUCH_END, this.changeVisible, this);
        }
        director.on(this.node.uuid, this.resetItem, this);
    }

    onDisable() {
        if (this.BtnNode) {
            this.BtnNode.off(Node.EventType.TOUCH_END, this.changeVisible, this);
        }
        director.off(this.node.uuid, this.resetItem, this);
    }
    addMenuItem(name: string, cb: Function) {
        const item = instantiate(this.MenuItem);
        const tranform = item.getComponent(UITransform);
        tranform.height = this.MenuItemSize.height;
        tranform.width = this.MenuItemSize.width;
        item.parent = this.MenuRootNode;
        const menuItem = item.getComponent(MenuItem);
        menuItem && menuItem.init(name, this.node.uuid, cb);
    }
    setMenuNode() {
        if (this.MenuRootNode) {
            this.MenuRootNode.on(Node.EventType.CHILD_ADDED, this.resetSize, this);
            const root = this.node.getComponent(UITransform);
            root && (root.width = this.MenuItemSize.width);
            const tranform = this.MenuRootNode.getComponent(UITransform);
            tranform && (tranform.width = this.MenuItemSize.width);
            const children = this.MenuRootNode.children;
            if (children.length > 0) {
                children.forEach((c) => {
                    this.resetSize(c);
                })
                if (!EDITOR) {
                    const firstItem = children[0].getComponent(MenuItem);
                    firstItem.onClick()
                }
            }
        }
        if (this.BtnNode) {
            const tranform = this.BtnNode.getComponent(UITransform);
            tranform && tranform.setContentSize(this.MenuItemSize);
        }
    }
    initLayout() {
        let layout = this.node.getComponent(Layout);
        if (!layout) {
            layout = this.node.addComponent(Layout);
            layout.type = 2;
            layout.resizeMode = 1;
            layout.spacingY = 1;
        }
        let rootlayout = this.MenuRootNode.getComponent(Layout);
        if (!rootlayout) {
            rootlayout = this.MenuRootNode.addComponent(Layout);
            rootlayout.type = 2;
            rootlayout.resizeMode = 1;
            rootlayout.spacingY = 1;
        }
    }
    resetItem(item: MenuItem) {
        if (this._item != item && this._item) this._item.resetColor();
        this._item = item;
    }
    changeVisible() {
        this._isVisible = !this._isVisible;
        if (this.MenuRootNode) {
            this.MenuRootNode.active = this._isVisible;
            if (this.BtnNode) {
                const lable = this.BtnNode.getComponentInChildren(Label);
                if (lable) {
                    lable.string = this._isVisible ? "Hide Menu" : "Show Menu";
                }
            }
        }
    }
    resetSize(node) {
        const tranform = node.getComponent(UITransform);
        tranform && tranform.setContentSize(this.MenuItemSize);
    }

}

