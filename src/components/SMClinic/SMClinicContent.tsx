import { Building2, FileText, Users, Star, HelpCircle, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '../common/SMButton/SMButton';
import { Card } from '../common/SMCard/SMCard';
import { Badge } from '../common/SMBadge/SMBadge';
import { clinicMenuData } from '../../data/SMClinicData/SMClinicData';
import { useRouter } from '@/components/SMRouter/SMRouter';
import clinicContentConfig from '@/config/clinicContent.json';

export function ClinicContent() {
  const { navigate } = useRouter();

  const getIcon = (id: string) => {
    switch (id) {
      case 'licenses': return <FileText className="w-6 h-6" />;
      case 'partners': return <Users className="w-6 h-6" />;
      case 'reviews': return <Star className="w-6 h-6" />;
      case 'requisites': return <Building2 className="w-6 h-6" />;
      case 'faq': return <HelpCircle className="w-6 h-6" />;
      case 'vacancies': return <Briefcase className="w-6 h-6" />;
      default: return <Building2 className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div
          className="mb-8 lg:mb-12"
        >
          <div className="text-center mb-6 lg:mb-8">
            <div className="w-16 h-16 bg-[#18A36C] rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl text-[#2E2E2E] mb-3 lg:mb-4">{clinicContentConfig.header.title}</h1>
            <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
              {clinicContentConfig.header.subtitle}
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8"
        >
          {clinicMenuData.map((section, index) => (
            <Card 
              key={section.id}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-[#E8E6E3] hover:border-[#18A36C] rounded-lg h-full"
              onClick={() => navigate(`/clinic/${section.id}`)}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-start gap-4 mb-4 flex-grow">
                  <div className="w-12 h-12 bg-[#18A36C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#18A36C]/20 transition-all duration-300 flex-shrink-0">
                    <div className="text-[#18A36C]">
                      {getIcon(section.id)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-[#2E2E2E] mb-2 group-hover:text-[#18A36C] transition-colors duration-300">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {section.description}
                    </p>
                    {section.children && section.children.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {section.children.slice(0, 3).map((child) => (
                          <Badge key={child.id} variant="secondary" className="text-xs bg-[#18A36C] text-white rounded-lg">
                            {child.title}
                          </Badge>
                        ))}
                        {section.children.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-[#18A36C] text-white rounded-lg">
                            +{section.children.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-[#18A36C] group-hover:text-[#18A36C]/80 transition-colors">
                    <span className="text-sm mr-2">{clinicContentConfig.sectionLabels.moreDetails}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>

                  {section.children && (
                    <span className="text-xs text-gray-600">
                      {section.children.length} {clinicContentConfig.sectionLabels.sections}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div
          className="bg-[#18A36C] rounded-lg p-6 lg:p-8 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl lg:text-2xl text-white mb-4">
              {clinicContentConfig.cta.title}
            </h2>
            <p className="text-white/90 mb-6 text-sm lg:text-base">
              {clinicContentConfig.cta.subtitle}
            </p>
            <Button
              onClick={() => navigate('/clinic/vacancies')}
              className="bg-white text-[#18A36C] hover:bg-white/90 hover:text-[#18A36C]/80 px-8 py-4 h-auto text-lg rounded-lg transition-all duration-300"
            >
              {clinicContentConfig.cta.buttonText}
              <ArrowRight className="w-5 h-5 ml-[2.5px]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}