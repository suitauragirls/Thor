const fs = require('fs');
let code = fs.readFileSync('src/components/HeroSection.tsx', 'utf8');

code = code.replace(/<div className="space-y-3">\s*<h1[\s\S]*?SUIT AURA GIRLS\s*<\/h1>\s*<p[\s\S]*?Elegance That Feels Like You"\s*<\/p>\s*<\/div>/, `<div className="space-y-4">
              <div className="relative inline-block">
                <motion.h1 
                  className="font-serif text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-transparent bg-clip-text bg-gradient-to-r from-[#2C1820] via-[#58152D] to-[#B88E28] drop-shadow-sm"
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: "200% auto" }}
                >
                  SUIT AURA GIRLS
                </motion.h1>
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-200/40 via-amber-200/20 to-rose-200/40 blur-xl -z-10 animate-pulse" />
              </div>
              <p className="font-serif italic text-xl sm:text-2xl text-[#8B2635] tracking-wide font-normal">
                "Elegance That Feels Like You"
              </p>
            </div>`);

fs.writeFileSync('src/components/HeroSection.tsx', code);
