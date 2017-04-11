/*
 *
 *	The CeCILL-B License
 *	
 *	Copyright (c) 2015/2016  | 
 *
 *
 *	This software is a computer program whose purpose is to [describe
 *	functionalities and technical features of your software].
 *
 *	This software is governed by the CeCILL-B license under French law and
 *	abiding by the rules of distribution of free software.  You can  use, 
 *	modify and/ or redistribute the software under the terms of the CeCILL-B
 *	license as circulated by CEA, CNRS and INRIA at the following URL
 *	"http://www.cecill.info". 
 *
 *	As a counterpart to the access to the source code and  rights to copy,
 *	modify and redistribute granted by the license, users are provided only
 *	with a limited warranty  and the software's author,  the holder of the
 *	economic rights,  and the successive licensors  have only  limited
 *	liability. 
 *
 *	In this respect, the user's attention is drawn to the risks associated
 *	with loading,  using,  modifying and/or developing or reproducing the
 *	software by the user in light of its specific status of free software,
 *	that may mean  that it is complicated to manipulate,  and  that  also
 *	therefore means  that it is reserved for developers  and  experienced
 *	professionals having in-depth computer knowledge. Users are therefore
 *	encouraged to load and test the software's suitability as regards their
 *	requirements in conditions enabling the security of their systems and/or 
 *	data to be ensured and,  more generally, to use and operate it in the 
 *	same conditions as regards security. 
 *
 *	The fact that you are presently reading this means that you have had
 *	knowledge of the CeCILL-B license and that you accept its terms.
 *
 */



nodefony.registerController("default", function(){

		/**
		 *	The class is a **`default` CONTROLLER** .
		 *	@module nodefony
		 *	@main nodefony
		 *	@class default
		 *	@constructor
		 *	@param {class} container   
		 *	@param {class} context
		 *	
		 */
		var defaultController = class defaultController extends nodefony.controller {
			constructor (container, context){
				super(container, context);
			}

			/**
		 	*
		 	*	@method indexAction
		 	*
		 	*/
			indexAction (){
				// markdown read and parse readme.md
				try {
					var path =  this.get("kernel").rootDir+"/src/nodefony/bundles//unitTestBundle/readme.md";	
					var file = new nodefony.fileClass(path);
					var res = this.htmlMdParser(file.content(file.encoding),{
						linkify: true,
						typographer: true	
					});
					return this.render("unitTestBundle::index.html.twig",{readme:res});
				}catch(e){
					return this.forward("frameworkBundle:default:system",{view: "unitTestBundle::index.html.twig",bundle:this.getParameters("bundles.unitTest")});
				}
			}
		};
		
		return defaultController;
});
