#
# Copies all the javascripts in place and updates them if necessary
#
require 'rails/generators'
class RightRailsGenerator < Rails::Generators::Base
  
  #  mandatory_options :source => "#{File.dirname(__FILE__)}/../../javascripts"
  
  def manifest
    
    source_path      = File.dirname(__FILE__)
    images_path      = "#{source_path}/../../../images/"
    javascripts_path = "#{source_path}/../../../javascripts/"    

    # creating the javascript directories

    directory javascripts_path + "/right","public/javascripts/right/"
    ['right.js', 'right-src.js', 'right-olds.js', 'right-olds-src.js'].each do |file|
      copy_file(javascripts_path + file,"public/javascripts/" + file)
    end

    # creating the iframed uploads layout
    copy_file source_path + "/templates/iframed.html.erb", "app/views/layouts/iframed.html.erb"
    
    # copying the images in place
    directory images_path,"public/images/rightjs-ui"
  end
  
  
  def banner
    "Usage: #{$0} right_rails"
  end
  
end
