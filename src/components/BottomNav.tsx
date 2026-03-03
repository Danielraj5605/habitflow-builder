import { NavLink } from "react-router-dom";
import { Home, Target, Plus, BarChart3, User } from "lucide-react";

const navItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Habits", url: "/habits", icon: Target },
    { title: "Add", url: "/add-habit", icon: Plus, isCta: true },
    { title: "Stats", url: "/summary", icon: BarChart3 },
    { title: "Account", url: "/account", icon: User },
];

export function BottomNav() {
    return (
        <nav className="bottom-nav md:hidden">
            <div className="flex items-center justify-around px-2 py-3">
                {navItems.map((item) => {
                    if (item.isCta) {
                        return (
                            <NavLink
                                key={item.title}
                                to={item.url}
                                className="flex flex-col items-center"
                            >
                                <div className="w-12 h-12 rounded-full btn-gold flex items-center justify-center -mt-5 shadow-gold animate-glow-pulse">
                                    <item.icon className="w-5 h-5" style={{ color: '#0A0A0F' }} />
                                </div>
                                <span className="text-[10px] mt-1 font-outfit font-medium" style={{ color: '#6B6380' }}>
                                    {item.title}
                                </span>
                            </NavLink>
                        );
                    }
                    return (
                        <NavLink
                            key={item.title}
                            to={item.url}
                            end={item.url === "/"}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-smooth ${isActive ? "text-gold-royal" : "text-muted-foreground"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-smooth ${isActive ? "bg-gold-royal/10" : ""
                                        }`}>
                                        <item.icon className={`w-5 h-5 transition-smooth ${isActive ? "text-gold-royal" : "text-muted-foreground"
                                            }`} />
                                    </div>
                                    <span className={`text-[10px] font-medium font-outfit transition-smooth ${isActive ? "text-gold-royal" : "text-muted-foreground"
                                        }`}>
                                        {item.title}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
