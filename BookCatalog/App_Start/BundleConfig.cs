using System.Web.Optimization;

namespace BookCatalog
{
	public class BundleConfig
	{
		// Дополнительные сведения об объединении см. на странице https://go.microsoft.com/fwlink/?LinkId=301862
		public static void RegisterBundles(BundleCollection bundles)
		{
			bundles.Add(new ScriptBundle("~/bundles/site").Include("~/Scripts/site.js"));
			bundles.Add(new StyleBundle("~/Content/css").Include("~/Content/bootstrap.css", "~/Content/site.css"));
			BundleTable.EnableOptimizations = true;
		}
	}
}
