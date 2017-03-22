cd ~/git/org.eclipse.om2m/

if [ ! -d org.eclipse.om2m.site.mn-cse/target/ ]; then
	mvn clean install
fi

cd org.eclipse.om2m.site.mn-cse/target/products/mn-cse/linux/gtk/x86/
sh start.sh
